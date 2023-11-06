import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbObjectService } from 'src/objects/services/db-object.service';

@Injectable()
export class TableUsersPermisionGuard implements CanActivate {
  constructor(@Inject(DbObjectService) private dbObjService: DbObjectService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { params, user } = context.switchToHttp().getRequest();
    return this.isAdmited(params.object, user.id, user.rol);
  }

  async isAdmited(object: string, user: string, rol: string) {
    const result = await this.dbObjService.getObject({ name: object });
    if (result) {
      const { authorizedUsers, authorizedRoles } = result;

      if (authorizedRoles.length > 0 && authorizedRoles.includes(rol)) {
        return true;
      } else {
        if (authorizedUsers.length > 0 && authorizedUsers.includes(user)) {
          return true;
        }
      }
    }
    throw new UnauthorizedException('insufficient privileges');
  }
}
