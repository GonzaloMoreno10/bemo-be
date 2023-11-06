import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDTO } from '../dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiBody({
    type: LoginDTO,
  })
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() request: Request) {
    return this.authService.generateJWT(request.user);
  }

  @Get('oauth')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // El usuario será redirigido automáticamente a la página de inicio de sesión de Google.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    // El usuario será redirigido aquí después del inicio de sesión en Google.
    // Puedes realizar cualquier redirección o lógica adicional que desees.
    res.redirect('/dashboard'); // Por ejemplo, redirige al usuario a la página de inicio después del inicio de sesión.
  }
}
