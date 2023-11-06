import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    const { headers } = context.switchToHttp().getRequest();

    if (!isPublic) {
      if (headers.authorization) {
        try {
          this.jwtService.verify(headers.authorization, {
            secret: this.configService.jwtSecret,
          });
          return true;
        } catch (err) {
          throw new UnauthorizedException('not allow');
        }
      }
      throw new ForbiddenException('not allow');
    }

    return true;
  }
}
