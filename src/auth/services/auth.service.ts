/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersSevice } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';
import { IUser } from 'src/users/entities/users.entity';
import { JwtPayload } from '../entities/jwt.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersSevice,
    private jwtService: JwtService,
  ) {}

  async validateUser(mail: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(mail);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { mail, ...rta } = user;
        return rta;
      }
    }
    return null;
  }

  generateJWT(user: Partial<IUser>) {
    const payload: JwtPayload = {
      id: user.id,
      rol: user.rol,
    };

    return { token: this.jwtService.sign(payload, { expiresIn: '1h' }) };
  }
}
