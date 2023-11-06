import { Inject, Injectable } from '@nestjs/common';
import { ModelAttributeColumnOptions } from 'sequelize';
import { CommonService } from 'src/common/services/common.service';
import { ObjectService } from 'src/objects/services/object.service';

@Injectable()
export class ValidationService {
  constructor(
    @Inject(CommonService) private commonService: CommonService,
    @Inject(ObjectService) private objectService: ObjectService,
  ) {}
  async validateTypes(
    object: any,
    name: string,
  ): Promise<{ attibute: string; type: string }[]> {
    const bindingFields = await this.objectService.getAttModel(name);
    const result = object.map((obj: any) => {
      const filtered = bindingFields.filter(
        (binding: ModelAttributeColumnOptions) => {
          const type: string = binding.type.valueOf().toString().split('(')[0];
          if (
            obj[0] === binding.field &&
            typeof obj[1] !== this.commonService.switchValidTypes(type)
          ) {
            return {
              field: binding.field,
              type: this.commonService.switchValidTypes(type),
              value: obj[1],
            };
          }
        },
      );
      return filtered.map((x) => x.field);
    });
    return result.filter((x: any) => x !== undefined && x.length > 0).flat();
  }

  validateAdditionals(request: any, binding: any): any {
    const result = request.filter((req: any) => !binding.includes(req));
    return result;
  }

  async validateRequiredFields(
    model: string,
    attributes: string[],
  ): Promise<string[]> {
    const requiredAtt = await this.objectService.getRequiredAttModel(model);
    const result = requiredAtt.map((binding: any) => {
      return {
        field: binding.field,
        exists: attributes.includes(binding.field),
      };
    });

    return result.filter((x) => !x.exists).map((x) => x.field);
  }
}
