import { Injectable, PipeTransform } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptPipe implements PipeTransform {
  transform(value: string) {
    return bcrypt.hash(value, 10);
  }
}
