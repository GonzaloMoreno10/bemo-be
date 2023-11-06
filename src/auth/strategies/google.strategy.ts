import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config'; // Asumiendo que estás usando la configuración de NestJS

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'), // Obtiene el ID del cliente desde la configuración
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'), // Obtiene el secreto del cliente desde la configuración
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'), // URL a la que Google redirigirá después del inicio de sesión
      scope: ['email', 'profile'], // Los permisos que solicitaremos a Google
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log(accessToken);
    // const user = await this.userService.findOrCreateUser(profile);
    // done(null, user);
  }
}
