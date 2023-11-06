import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ObjectNamePipe implements PipeTransform {
  transform(value: string) {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '').trim();
  }
}
