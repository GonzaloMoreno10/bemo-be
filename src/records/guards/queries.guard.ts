import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ObjectService } from 'src/objects/services/object.service';
import { ValidationService } from '../services/validation.service';
import { CommonService } from 'src/common/services/common.service';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class QueriesGuard implements CanActivate {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(ValidationService) private validationService: ValidationService,
    @Inject(CommonService) private commonService: CommonService,
    @Inject(DbObjectService) private dbObjService: DbObjectService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { query, params } = context.switchToHttp().getRequest();

    return this.validateQueries(query, params);
  }

  async validateQueries(queries: any, params: any): Promise<boolean> {
    const modelName = params.object;
    try {
      const objectAttr: any = await this.objectService.getFIlterableAttr(
        modelName,
      );
      if (!objectAttr) {
        throw new BadRequestException(`${modelName} model not exist`);
      }
      if (queries) {
        const orderAccepted: string[] =
          await this.objectService.getSorteableAttrModel(modelName, true);

        orderAccepted.push('id');

        if (queries.pageSize) {
          queries.pageSize = parseInt(queries.pageSize);
        }

        if (queries.page) {
          queries.page = parseInt(queries.page);
        }

        //*Begin especial filters

        if (queries.orderBy) {
          const splited = queries.orderBy
            .replace('(', '')
            .replace(')', '')
            .split(',');

          if (splited.length == 2) {
            if (!['desc', 'asc'].includes(splited[1])) {
              throw new Error(`${splited[1]} is invalid in order clause`);
            }
            if (!orderAccepted.includes(splited[0])) {
              throw new Error(
                `It is not possible to sort by the ${splited[0]} attribute`,
              );
            }
          } else {
            throw new BadRequestException('Invalid orderBy');
          }
        }

        if (queries.include) {
          const include = queries.include
            .replace('(', '')
            .replace(')', '')
            .split(',');

          for (const inc of include) {
            const exist = await this.dbObjService.getObject({ name: inc });
            if (!exist) {
              throw new Error(`Invalid model ${inc} in include filter`);
            }
          }
        }

        //*End special filters

        const acceptedQueries = objectAttr.map((x: any) => x.field);

        acceptedQueries.push('orderBy', 'include', 'page', 'pageSize');

        const queryErrors = this.validationService.validateAdditionals(
          Object.keys(queries),
          acceptedQueries,
        );

        if (queryErrors.length > 0) {
          throw new Error(`[${queryErrors}] is not an allowed filter`);
        }

        //*Adding especial filters

        const validTypes = this.commonService.validateQueryType(
          queries,
          objectAttr,
        );

        if (validTypes.length > 0) {
          let error = '';
          validTypes.forEach((x) => {
            error += `${x.field} must be an ${x.type} `;
          });
          throw new Error(error);
        }
      }
      return true;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
