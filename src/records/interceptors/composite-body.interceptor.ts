import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbObjectService } from 'src/objects/services/db-object.service';
import { CompositeRequestDTO } from '../dtos/composite.dto';

@Injectable()
export class CompositeBodyInterceptor implements NestInterceptor {
  constructor(@Inject(DbObjectService) private dbObjService: DbObjectService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const body: CompositeRequestDTO = request.body;

    for (const composite of body.compositeRequest) {
      const object = await this.dbObjService.getObject({
        name: composite.object,
      });
      if (composite.upsert) {
        if (object.auditFields) {
          composite.records.forEach((x: any) => {
            x.updatedAt = new Date();
          });
        }
        if (object.userAudit) {
          composite.records.forEach((x: any) => {
            x.updatedUser = request.user.id;
            x.createdUser = request.user.id;
          });
        }
      } else {
        if (object.userAudit) {
          composite.records.forEach((x: any) => {
            x.createdUser = request.user.id;
          });
        }
      }
    }

    return next.handle();
  }
}
