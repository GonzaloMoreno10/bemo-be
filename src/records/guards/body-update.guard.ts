import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ValidationService } from '../services/validation.service';
import { ObjectService } from 'src/objects/services/object.service';

@Injectable()
export class BodyUpdateGuard implements CanActivate {
  constructor(
    @Inject(ValidationService) private validationService: ValidationService,
    @Inject(ObjectService) private objectService: ObjectService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { body, params } = context.switchToHttp().getRequest();
    return this.validateBody(body, params.object);
  }

  async validateBody(body: any, objectName: string): Promise<boolean> {
    try {
      const bindings = await this.objectService.getUpdateableAttrModel(
        objectName,
      );
      if (!body || Object.keys(body).length == 0) {
        throw new BadRequestException(`Body is empty`);
      }

      const additionalsFields =
        await this.validationService.validateAdditionals(
          Object.keys(body),
          bindings.map((x) => x.field),
        );

      if (additionalsFields.length > 0) {
        throw new BadRequestException(
          `Cannot update next fields [${additionalsFields}]`,
        );
      }

      const typeValidationResult = await this.validationService.validateTypes(
        Object.entries(body),
        objectName,
      );

      if (typeValidationResult.length > 0) {
        throw new BadRequestException(`Invalid types: ${typeValidationResult}`);
      }
      return true;
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }
}
