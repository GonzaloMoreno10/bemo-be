import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ObjectModel } from 'src/objects/models/object.model';
import { invalidKeyWords, requiredKeyWords } from '../constants/query.constant';

@Injectable()
export class QueryService {
  constructor(@InjectModel(ObjectModel) private seqModel: ObjectModel) {}

  async getQuery(query: string) {
    const result = await this.seqModel.sequelize.query(query);
    return result[0];
  }

  validateInvalidKeyWords(queryArray: string[]): boolean {
    let result = true;
    queryArray.forEach((x: string) => {
      if (invalidKeyWords.includes(x.trim().toLowerCase())) {
        result = false;
        return;
      }
    });
    return result;
  }

  validateBindingsKeyWords(queryArray: string[]): boolean {
    let result = true;
    queryArray.forEach((x: string) => {
      if (!requiredKeyWords.includes(x.trim().toLowerCase())) {
        result = false;
        return;
      }
    });
    return result;
  }
}
