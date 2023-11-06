import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class UserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly apellido: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly mail: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  readonly fecNac: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly rol: number;
}

export class UserFilterDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly apellido: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly mail: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly servicio: number;
}

export class UpdateUserDTO extends PartialType(UserDTO) {}

export class UserQueryDTO extends PartialType(UserFilterDTO) {}
