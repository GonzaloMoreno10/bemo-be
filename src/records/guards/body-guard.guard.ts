import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

import { ValidationService } from 'src/records/services/validation.service';
import { ObjectService } from 'src/objects/services/object.service';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class BodyGuard implements CanActivate {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(DbObjectService) private dbObjectService: DbObjectService,
    @Inject(ValidationService) private validationService: ValidationService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return this.validateBody(request);
  }

  private async validateBody(request: Request): Promise<boolean> {
    // Realizar operaciones asíncronas, como validaciones de bases de datos, llamadas a API, etc.
    const { body } = request;
    const { object } = request.params;

    const schema = await this.dbObjectService.getDescribe(object);
    try {
      if (schema) {
        const bindingResult =
          await this.validationService.validateRequiredFields(
            object,
            Object.keys(body),
          );

        if (bindingResult.length > 0) {
          throw new BadRequestException(
            `Missing binding fields: [${bindingResult}]`,
          );
        }

        const typeValidationResult = await this.validationService.validateTypes(
          Object.entries(body),
          object,
        );

        if (typeValidationResult.length > 0) {
          throw new BadRequestException(
            `Invalid types: ${typeValidationResult}`,
          );
        }

        return true;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }
}
