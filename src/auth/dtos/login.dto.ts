import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly mail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
