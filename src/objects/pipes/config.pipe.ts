import { BadRequestException, Inject, Injectable, PipeTransform } from '@nestjs/common';
import { NewObjConfig } from '../dtos/object.dto';
import { ValidationService } from 'src/records/services/validation.service';
import { ValidService } from '../services/valid.service';
import { object } from 'joi';

@Injectable()
export class ConfigPipe implements PipeTransform {

  constructor(@Inject(ValidService) private validService: ValidService) { }
  transform(value: NewObjConfig) {
    if (Object.keys(value).length == 0) {
      throw new BadRequestException('Invalid body')
    }
    this.validService.validConfigs(value)
    return value;
  }
}
