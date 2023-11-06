import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROL_KEY } from '../decorators/rol.decorator';

@Injectable()
export class RolGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const assignedRol: number[] = this.reflector.get(
      ROL_KEY,
      context.getHandler(),
    );
    const { rol: loggedRol } = context.switchToHttp().getRequest().user;
    if (assignedRol) {
      if (!assignedRol.includes(loggedRol)) {
        throw new UnauthorizedException('insufficient privileges');
      }
    }
    return true;
  }
}
