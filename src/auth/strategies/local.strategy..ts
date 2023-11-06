import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { IUser } from 'src/users/entities/users.entity';

@Injectable()
export class LocalStrategyService extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'mail',
      passwordField: 'password',
    });
  }

  async validate(mail: string, password: string): Promise<IUser | null> {
    const user = await this.authService.validateUser(mail, password);
    if (!user) {
      throw new UnauthorizedException('not allow');
    }
    return user;
  }
}
