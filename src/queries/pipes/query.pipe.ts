import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryPipe implements PipeTransform {
  transform(value: any) {
    try {
      const keywords = value.split(' ');
      if (keywords[0].toLowerCase() !== 'select') {
        throw new Error(`Invalid keyword: ${keywords[0]}`);
      }
      if (keywords.includes('insert')) {
        throw new BadRequestException('Invalid query');
      }
      if (keywords.includes('insert')) {
        throw new BadRequestException('Invalid query');
      }

      return value.replace('+', ' ');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
