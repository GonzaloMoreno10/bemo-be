import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { deleteStrategy } from 'src/objects/constants/object.constant';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class BodyUsersInterceptor implements NestInterceptor {
  constructor(@Inject(DbObjectService) private dbObjService: DbObjectService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();

    const { params, body, user, method } = request;

    const object = await this.dbObjService.getObject({ name: params.object });

    if (object.userAudit) {
      if (method === 'PUT') {
        body.updatedUser = user['id'];
        body.updatedAt = new Date();
      }
      if (method === 'POST') {
        body.createdUser = user['id'];
      }
      if (method === 'DELETE') {
        if (object.delStrategy == deleteStrategy.logic) {
          body.enabled = false;
        }
        body.deletedUser = user['id'];
        body.deletedAt = new Date();
      }
    }
    return next.handle();
  }
}
