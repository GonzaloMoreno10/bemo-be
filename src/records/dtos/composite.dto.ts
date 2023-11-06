import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompositeDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  object: string;
  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  records: any[];
  @IsOptional()
  @IsBoolean()
  upsert: boolean;
  @IsOptional()
  @IsString()
  updateColumnName: string;
}

export class CompositeRequestDTO {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  allOrNone: boolean;
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  compositeRequest: CompositeDTO[];
}
