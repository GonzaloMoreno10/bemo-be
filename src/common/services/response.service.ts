import { Injectable } from '@nestjs/common';
import { DatabaseError, ValidationError, ValidationErrorItem } from 'sequelize';
import { ValidationError as validatErrorCV } from 'class-validator';

@Injectable()
export class ResponseService {
  handleDbError(err: ValidationError | DatabaseError) {
    if (err instanceof ValidationError) {
      return err.errors
        .map((x: ValidationErrorItem) => {
          return {
            error: x.message,
            code: x.type,
            value: x.value,
            path: x.path,
          };
        })
        .filter((x) => x.path !== 'enabled');
    }
    if (err instanceof DatabaseError) {
      return err.message;
    }
  }

  handleCompositeError(err: ValidationError, position: number) {
    position++;
    const fields = [];
    const details = [];
    err.errors.forEach((x) => {
      fields.push(x.path);
      details.push(`Error ${x.message} in position: ${position}`);
    });

    return details;
  }

  handleCvError(errors: validatErrorCV[]) {
    return errors
      .map((error: validatErrorCV) => {
        const result = Object.values(error.constraints);
        return result;
      })
      .flat();
  }
}
