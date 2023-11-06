import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common';
import { ObjectAttrDef } from '../dtos/object.dto';
import { ResponseService } from 'src/common/services/response.service';
import { ValidService } from '../services/valid.service';
import { ObjectService } from '../services/object.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UpdateObjectPipe implements PipeTransform {

  constructor(@Inject(ResponseService) private responseService: ResponseService,
    @Inject(ValidService) private validService: ValidService,
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(REQUEST) protected readonly request: Request) { }
  async transform(value: ObjectAttrDef[]) {
    try {
      const object = this.request['params'].object

      if (!value) {
        throw new UnprocessableEntityException('Payload is empty')
      } else {
        if (value.length == 0) {
          throw new UnprocessableEntityException('attributes cannot be empty')
        }
      }

      //Se validan columnas

      this.validService.validAttributes(value)

      const dbAttr = await this.objectService.getAllAttModel(object)

      const errors = [];
      value.forEach((x: ObjectAttrDef, index: number) => {
        if (dbAttr.includes(x.name)) {
          errors.push(`${x.name} already exists in ${object} in position ${index}`)
        }
      })

      if (errors.length > 0) {
        throw new BadRequestException(errors)
      }

      return value;
    } catch (err) {
      throw new BadRequestException(err.response?.message ?? err.message)
    }

  }
}
