import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntegerPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value !== 'number') {
      const result = parseInt(value);
      if (!isNaN(result)) {
        return result;
      }
      throw new BadRequestException('Invalid integer value');
    }
    return value;
  }
}
