import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ObjectService } from '../services/object.service';
import { DbObjectService } from '../services/db-object.service';

@Injectable()
export class ExistObjectGuard implements CanActivate {
  constructor(
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(DbObjectService) private dbObjService: DbObjectService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { params } = context.switchToHttp().getRequest();
    return this.existModel(params.object);
  }

  async existModel(modelName: string) {
    const existObj = await this.dbObjService.getObject({ name: modelName });
    if (existObj) {
      const existsTable = await this.objectService.existsTable(modelName);

      if (!existsTable) {
        throw new BadRequestException(`${modelName} model not exist`);
      }
      return true;
    }
    throw new BadRequestException(`${modelName} model not exist`);
  }
}
