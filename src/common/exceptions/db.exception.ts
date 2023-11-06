import { HttpException, HttpStatus } from '@nestjs/common';

export class DbException extends HttpException {
  constructor(message: string, detail: any, attribute?: string) {
    super(
      { status: HttpStatus.UNPROCESSABLE_ENTITY, message, detail, attribute },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
