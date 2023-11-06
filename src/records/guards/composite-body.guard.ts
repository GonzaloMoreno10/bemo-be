import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CompositeRequestDTO } from '../dtos/composite.dto';
import { bodyCompositeValid } from '../validator/compositeBody.validator';
import { ObjectService } from 'src/objects/services/object.service';
import { ValidationService } from '../services/validation.service';

@Injectable()
export class CompositeBodyGuard implements CanActivate {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(ValidationService) private validService: ValidationService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { body } = context.switchToHttp().getRequest();

    return this.validCompositeBody(body);
  }

  async validCompositeBody(body: CompositeRequestDTO) {
    const errors: any = [];
    for (const composite of body.compositeRequest) {
      const validationRes = bodyCompositeValid.validate(composite);
      if (validationRes.error) {
        throw new BadRequestException(`${validationRes.error.message}  `);
      }

      const model = await this.objectService.getAllAttModel(composite.object);
      if (!model) {
        throw new BadRequestException(`${composite.object} model is invalid`);
      }

      if (composite.upsert) {
        if (!composite.updateColumnName) {
          throw new BadRequestException(
            `If especified upsert must be specified id column name`,
          );
        }
        if (!model.includes(composite.updateColumnName)) {
          throw new BadRequestException(`Invalid update column name`);
        }
      }
      let index2 = 0;
      for (const reqBody of composite.records) {
        if (reqBody.enabled !== undefined) {
          throw new BadRequestException(`Invalid attribute enabled`);
        }
        const validBindingsRes = await this.validService.validateRequiredFields(
          composite.object,
          Object.keys(reqBody),
        );
        if (validBindingsRes.length > 0) {
          errors.push(
            `Missing binding fields: [${validBindingsRes}] in object ${composite.object} in position ${index2} `,
          );
        }
        const validateTypes = await this.validService.validateTypes(
          Object.entries(reqBody),
          composite.object,
        );

        if (validateTypes.length > 0) {
          errors.push(
            `Invalid type in attributes [${validateTypes}] in object ${composite.object} in position ${index2} `,
          );
        }

        if (composite.upsert) {
          if (!reqBody[composite.updateColumnName]) {
            throw new BadRequestException(
              `${composite.updateColumnName} is not specified in model ${
                composite.object
              }, position: ${index2 + 1}`,
            );
          }
        }

        index2++;
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return true;
  }
}
