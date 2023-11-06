import { Injectable } from '@nestjs/common';
import { queryOperators } from 'src/records/constants/record.constant';

@Injectable()
export class CommonService {
  switchValidTypes(type: any): string {
    switch (type) {
      case 'VARCHAR':
        return 'string';
      case 'BOOLEAN':
        return 'boolean';
      case 'INTEGER':
        return 'number';
      case 'DECIMAL':
        return 'number';
      case 'FLOAT':
        return 'number';
      case 'DATE':
        return 'string';
      case 'TIMESTAMP':
        return 'string';
      default:
        return 'null';
    }
  }

  validateInteger(values: string[]) {
    let result = true;
    values.forEach((x: string) => {
      const convert = parseInt(x);
      if (isNaN(convert)) {
        result = false;
        return;
      }
    });
    return result;
  }

  parseBoolean(string: string): boolean {
    return string.toLowerCase() === 'true';
  }

  validateQueryType(queries: any, modelAttr: any) {
    return Object.entries(queries)
      .map((x) => {
        //*En el caso que venga una query tipo (gt,10) se extrae el value [1]
        const queryVal: any = x[1].toString().includes('(')
          ? x[1].toString().replace('(', '').replace(')', '').split(',')
          : x[1];
        const val = queryVal;

        const type = modelAttr.filter((attr) => attr.field == x[0])[0]?.type;
        if (queryVal[0] === 'between') {
          if (!val[2]) {
            return { field: queryVal[0], type: `tree components` };
          }
          if (
            type === 'INTEGER' &&
            (isNaN(parseInt(queryVal[1] as string)) ||
              isNaN(parseInt(queryVal[2] as string)))
          ) {
            return { field: x[0], type: 'number' };
          }
        }

        if (queryVal[0] === 'in') {
          if (queryVal.length <= 2) {
            return { field: queryVal[0], type: `tree components` };
          }
          if (
            type === 'INTEGER' &&
            !this.validateInteger(queryVal.filter((x: string) => x !== 'in'))
          ) {
            return { field: x[0], type: 'number' };
          }
        }
        if (type == 'INTEGER') {
          let convert: any;
          if (Array.isArray(queryVal)) {
            convert = parseInt(queryVal[1] as string);
          } else {
            convert = parseInt(queryVal[0] as string);
          }

          if (isNaN(convert)) {
            return { field: x[0], type: 'number' };
          }
          if (
            Array.isArray(queryVal) &&
            !queryOperators.includes(queryVal[0])
          ) {
            return { field: 'query operator', type: `${queryOperators}` };
          }
        }
        if (
          type == 'BOOLEAN' &&
          !['false', 'true'].includes(queryVal.toString().toLowerCase())
        ) {
          return { field: x[0], type: 'boolean' };
        }
      })
      .filter((x) => x !== undefined);
  }
}
