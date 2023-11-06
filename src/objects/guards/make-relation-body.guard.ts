import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MakeRelationBody } from '../dtos/object.dto';
import { DbObjectService } from '../services/db-object.service';
import { objectRelations } from '../constants/object.constant';
import { ObjectService } from '../services/object.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ResponseService } from 'src/common/services/response.service';

@Injectable()
export class MakeRelationBodyGuard implements CanActivate {
  constructor(
    @Inject(DbObjectService) private dbObjectService: DbObjectService,
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(ResponseService) private responseService: ResponseService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { body, params } = context.switchToHttp().getRequest();
    return this.isValid(body.entries, params.object);
  }

  async isValid(
    entries: MakeRelationBody[],
    objName: string,
  ): Promise<boolean> {
    for (const entry of entries) {
      const errors = await validate(plainToClass(MakeRelationBody, entry));
      if (errors.length > 0) {
        throw new BadRequestException(
          this.responseService.handleCvError(errors),
        );
      }

      const object = await this.dbObjectService.getObject({
        name: entry.objectName,
      });
      if (objName === entry.objectName) {
        throw new BadRequestException(
          `Cannot use the same object ${objName} to make relation`,
        );
      }

      if (!object) {
        throw new BadRequestException(`${entry.objectName} object not exists`);
      } else {
        if (!objectRelations.includes(entry.relation)) {
          throw new BadRequestException(
            `invalid relation type: ${entry.relation} in ${entry.objectName} object`,
          );
        }
        const attributes = await this.objectService.getAllAttModel(objName);
        if (!attributes.includes(entry.foreignKey)) {
          throw new BadRequestException(
            `${entry.foreignKey} field not exists in ${entry.objectName}`,
          );
        }
      }
    }

    return true;
  }
}
