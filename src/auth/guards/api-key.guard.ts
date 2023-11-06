import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ConfigType } from '@nestjs/config';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import config from 'src/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (!isPublic) {
      const request = context.switchToHttp().getRequest<Request>();
      const { headers } = request;
      const isAuth = headers.authorization === this.configService.apiKey;
      if (headers.authorization) {
        if (!isAuth) {
          throw new UnauthorizedException('not allowed');
        }
        return isAuth;
      } else {
        return false;
      }
    }
    return true;
  }
}
