import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class IsDeleteableGuard implements CanActivate {
  constructor(@Inject(DbObjectService) private dbObjService: DbObjectService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { params } = context.switchToHttp().getRequest();
    return this.isDelete(params.object);
  }

  async isDelete(object: string) {
    const exists = await this.dbObjService.getObject({
      name: object,
      deleteable: true,
    });

    if (!exists) {
      throw new BadRequestException(`${object} model not admit delete`);
    }

    return true;
  }
}
