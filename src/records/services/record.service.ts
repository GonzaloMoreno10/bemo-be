import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { ModelCtor } from 'sequelize-typescript';

import { ObjectModel } from 'src/objects/models/object.model';
import { DbObjectService } from 'src/objects/services/db-object.service';
import { ObjectService } from 'src/objects/services/object.service';
import { CompositeDTO, CompositeRequestDTO } from '../dtos/composite.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseService } from 'src/common/services/response.service';
import {
  commonAttributes,
  deleteStrategy,
} from 'src/objects/constants/object.constant';
import { ValidationService } from './validation.service';

@Injectable()
export class RecordService {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(DbObjectService) private dbObjectService: DbObjectService,
    @InjectModel(ObjectModel) private models: typeof ObjectModel,
    @Inject(ResponseService) private responseService: ResponseService,
    @Inject(ValidationService) private validationService: ValidationService,
  ) {}
  async createRegisters(tableName: string, object: any) {
    const miModel: ModelCtor = await this.objectService.getModelSync(tableName);
    console.log(miModel.associations);
    return miModel.create(object);
  }

  async getRegisters(tableName: string, filters: any) {
    const miModel: ModelCtor = await this.objectService.getModelSync(tableName);
    const dbObjModel = await this.dbObjectService.getObject({
      name: tableName,
    });
    if (dbObjModel.delStrategy == deleteStrategy.logic) {
      filters.enabled = true;
    }

    let orderBy: any[];
    const include: any = [];
    if (filters.orderBy) {
      orderBy = [filters.orderBy.replace('(', '').replace(')', '').split(',')];
      delete filters.orderBy;
    }
    if (filters.include) {
      console.log(filters.include.split(','));
      for (const inc of filters.include.split(',')) {
        const model: ModelCtor = await this.objectService.getModelSync(inc);
        const attr = await this.dbObjectService.getObject({ name: inc });
        const rel = { model, required: false };
        if (attr.delStrategy == deleteStrategy.logic) {
          rel['where'] = {
            enabled: true,
          };
        }
        rel['attributes'] = { exclude: commonAttributes };
        include.push(rel);
      }
      delete filters.include;
    }

    Object.entries(filters).forEach((x: any) => {
      if (typeof x[1] === 'string') {
        if (x[1].includes(')')) {
          const result = x[1].replace('(', '').replace(')', '').split(',');
          switch (result[0]) {
            case 'lk':
              filters[x[0]] = { [Op.like]: `%${result[1]}%` };
              break;
            case 'between':
              filters[x[0]] = { [Op[result[0]]]: [result[1], result[2]] };
              break;
            case 'in':
              filters[x[0]] = {
                [Op[result[0]]]: [result.filter((x) => x !== 'in')],
              };
              break;
            default:
              filters[x[0]] = { [Op[result[0]]]: parseInt(result[1]) };
              break;
          }
        }
      }
    });

    const pageSize = filters.pageSize ?? 2;
    const page = filters.page ?? 1;
    const offset = (page - 1) * pageSize;

    delete filters.pageSize;
    delete filters.page;

    return miModel.findAll({
      where: { ...filters },
      limit: pageSize,
      offset,
      attributes: {
        exclude: commonAttributes.filter((x: string) => x !== 'id'),
      },
      order: orderBy,
      include,
    });
  }

  async getRegisterById(tableName: string, id?: number) {
    const whereClause: any = {};
    const miModel: ModelCtor = await this.objectService.getModelSync(tableName);
    const attr = await this.objectService.getAllAttModel(tableName);
    if (attr.includes('enabled')) whereClause.enabled = true;
    whereClause.id = id;
    return miModel.findOne({
      where: whereClause,
      attributes: {
        exclude: commonAttributes.filter((x: string) => x !== 'id'),
      },
    });
  }

  async deleteRegister(object: string, id: number, deletedUser?: number) {
    const obj: ObjectModel = await this.dbObjectService.getObject({
      name: object,
    });
    const model: ModelCtor = await this.objectService.getModelSync(object);
    if (obj.delStrategy === deleteStrategy.logic) {
      const updated: any = {
        enabled: false,
        deletedAt: new Date(),
        deletedUser,
      };
      return model.update(updated, { where: { id } });
    } else {
      return model.destroy({ where: { id } });
    }
  }

  async update(objectName: string, object: any, id: number) {
    const model: ModelCtor = await this.objectService.getModelSync(objectName);
    return model.update({ ...object }, { where: { id } });
  }

  async sendComposite(request: CompositeRequestDTO) {
    const t: Transaction = await this.models.sequelize.transaction();

    let error = false;
    const result = { compositeResponse: {} };
    try {
      for (const composite of request.compositeRequest) {
        result.compositeResponse[composite.object] = [];
        const model = await this.objectService.getModelSync(composite.object);
        const bindings = await this.objectService.getUpdateableAttrModel(
          composite.object,
        );
        let index = 0;
        for (const req of composite.records) {
          const object = await this.dbObjectService.getObject({
            name: composite.object,
          });

          try {
            if (error && request.allOrNone) {
              result.compositeResponse[composite.object].push({
                result: `Entity not opered because rollback`,
                errors: [],
              });
            } else {
              let res: { [x: string]: any };

              //*Si es upsert busco y si existe actualizo, si no creo
              if (composite.upsert) {
                const whereClause = {};
                if (object.delStrategy === deleteStrategy.logic) {
                  whereClause['enabled'] = true;
                }
                whereClause[composite.updateColumnName] =
                  req[composite.updateColumnName];
                const exist = await model.findOne({ where: whereClause });
                if (exist) {
                  const additionalsFields =
                    await this.validationService.validateAdditionals(
                      Object.keys(req),
                      bindings.map((x) => x.field),
                    );

                  if (additionalsFields.length > 0) {
                    throw new BadRequestException(
                      `Invalid attributes [${additionalsFields}]`,
                    );
                  }

                  delete req['createdUser'];
                  res = await model.update(req, {
                    where: whereClause,
                    transaction: t,
                  });

                  result.compositeResponse[composite.object].push({
                    result: `${composite.object} updated with ${
                      composite.updateColumnName
                    } ${req[composite.updateColumnName]}`,
                    errors: [],
                  });
                } else {
                  res = await model.create(req, { transaction: t });
                  result.compositeResponse[composite.object].push({
                    result: `${composite.object} created with id ${res['id']}`,
                    errors: [],
                  });
                }
                //*Si no es upsert, solo creo
              } else {
                res = await model.create(req, { transaction: t });
                result.compositeResponse[composite.object].push({
                  result: `${composite.object} created with id ${res['id']}`,
                  errors: [],
                });
              }
            }
          } catch (err) {
            error = true;
            console.log(err);
            result.compositeResponse[composite.object].push({
              errors: this.responseService.handleCompositeError(err, index),
            });
          }
          index++;
        }
      }

      if (error && request.allOrNone) {
        request.compositeRequest
          .map((x: CompositeDTO) => x.object)
          .forEach((x: string) => {
            result.compositeResponse[x].forEach((y: any) => {
              if (y.result) {
                y.result = 'Transaction was rolled back because an error';
              }
            });
          });

        t.rollback();
        return result;
      }
      t.commit();
      return result;
    } catch (err) {
      t.rollback();
      throw new InternalServerErrorException(
        this.responseService.handleDbError(err),
      );
    }
  }
}
