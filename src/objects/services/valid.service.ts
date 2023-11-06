import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  NewObjConfig,
  ObjectAttrDef,
  ObjectRelationDTO,
} from '../dtos/object.dto';
import { AttTypes, objectRelations } from '../constants/object.constant';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ResponseService } from 'src/common/services/response.service';
import { ObjectService } from './object.service';

@Injectable()
export class ValidService {
  constructor(
    @Inject(ResponseService) private responseServ: ResponseService,
    @Inject(ObjectService) private objService: ObjectService,
  ) {}

  validAttributes(attributes: ObjectAttrDef[]): void {
    const errores = [];

    let index = 0;
    for (const attribute of attributes) {
      const classValid = validateSync(plainToClass(ObjectAttrDef, attribute));
      if (classValid.length > 0) {
        throw new BadRequestException(
          this.responseServ.handleCvError(classValid),
        );
      }
      //*Valid name
      if (attribute.name.includes(' ')) {
        errores.push(`Invalid property name in position ${index}`);
      } else {
        //*Valid type
        if (
          !AttTypes.includes(attribute.type.toString().toUpperCase().trim())
        ) {
          errores.push(
            `Invalid type ${attribute.type} in attribute ${attribute.name}`,
          );
        } else {
          if (
            attribute.type.toUpperCase().trim() === 'VARCHAR' &&
            (!attribute.size || attribute.size < 1 || attribute.size > 250)
          ) {
            errores.push(`Invalid string size in ${attribute.name} attribute`);
          }
        }
      }
      index++;
    }
    if (errores.length > 0) {
      throw new BadRequestException(errores.flat());
    }
  }

  validConfigs(configs: NewObjConfig): void {
    const errors = validateSync(plainToClass(NewObjConfig, configs));
    if (errors.length > 0) {
      throw new BadRequestException(this.responseServ.handleCvError(errors));
    }
  }

  async validRelations(relations: ObjectRelationDTO[]): Promise<void> {
    const errors = [];
    let index = 0;
    for (const relation of relations) {
      const error = validateSync(plainToClass(ObjectRelationDTO, relation));
      if (error.length > 0) {
        throw new BadRequestException(this.responseServ.handleCvError(error));
      }
      if (!objectRelations.includes(relation.type)) {
        errors.push(
          `${relation.type} is not a valid relation type in position ${index}`,
        );
      }

      const existModel = await this.objService.existObject(relation.objectName);

      if (!existModel) {
        errors.push(
          `${relation.objectName} is not a valid object in position ${index}`,
        );
      }
      index++;
    }
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  validCompositeUnique(uniques: string[], attributes: string[]): void {
    const errors = [];
    uniques.forEach((unique: string, index: number) => {
      if (!attributes.includes(unique)) {
        errors.push(
          `${unique} is defined in compositeUnique but not in properties`,
        );
      }
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
