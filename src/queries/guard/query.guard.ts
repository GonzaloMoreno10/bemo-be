import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ObjectService } from 'src/objects/services/object.service';
import { QueryService } from '../services/query.service';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class QueryGuard implements CanActivate {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(DbObjectService) private dbObjService: DbObjectService,
    @Inject(QueryService) private queryService: QueryService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { q } = context.switchToHttp().getRequest().query;
    if (q) {
      const queryArray = q.split(' ');
      return this.validateTable(
        queryArray[queryArray.indexOf('from') + 1],
        queryArray,
      );
    } else {
      throw new BadRequestException('Invalid query');
    }
  }
  async validateTable(
    tableName: string,
    queryArray: string[],
  ): Promise<boolean> {
    const existTable = await this.objectService.existsTable(tableName);
    const existObj = await this.dbObjService.getObject({ name: tableName });
    if (!existTable || !existObj) {
      throw new BadRequestException(`${tableName} model not exists`);
    }
    if (queryArray[0].toLowerCase() !== 'select') {
      throw new BadRequestException(`Invalid keyword: ${queryArray[0]}`);
    }
    if (!this.queryService.validateInvalidKeyWords(queryArray)) {
      throw new BadRequestException('Invalid query');
    }
    return true;
  }
}
