import {
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectService } from '../services/object.service';

@Injectable()
export class ExistObjectPipe implements PipeTransform {
  constructor(@Inject(ObjectService) private objectService: ObjectService) {}
  async transform(value: string) {
    const exists = await this.objectService.existsTable(value);

    if (!exists) {
      throw new BadRequestException(`${value} model not exist`);
    }
    return value;
  }
}
