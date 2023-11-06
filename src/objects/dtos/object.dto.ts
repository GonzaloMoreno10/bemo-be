import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import {
  deleteStrategy,
  objectRelatiosType,
} from '../constants/object.constant';
import { AttType, updColumnUpdate } from '../types/object.types';

export class NewObjConfig {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  auditFields: boolean;
  @ApiProperty()
  @IsString()
  @IsOptional()
  delStrategy: deleteStrategy;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  hasTrigger: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  deleteable: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  queryable: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  userAudit: boolean;
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  authorizedRoles: string[];
  @ApiProperty()
  @IsOptional()
  @IsArray()
  authorizedUsers: string[];
}
export class NewObjectDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  properties: ObjectAttrDef[];
  @ApiProperty()
  @IsArray()
  @IsOptional()
  compositeUnique: string[];
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  configs: NewObjConfig;
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  relations: ObjectRelationDTO[];
}

export class ObjectAttrDef {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: AttType;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  size: number;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  required: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  unique: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  filterable: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  sortable: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  updateable: boolean;
  @ApiProperty()
  @IsString()
  @IsOptional()
  defaultValue: any;
}

export class SObject {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  userId?: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  object: any;
  @ApiProperty()
  userAudit: boolean;
  @ApiProperty()
  delStrategy: string;
  @ApiProperty()
  hasTrigger: boolean;
  @ApiProperty()
  auditFields: boolean;
  @ApiProperty()
  deleteable: boolean;
  @ApiProperty()
  queryable: boolean;
  @ApiProperty()
  @IsObject()
  objConfig: any;
  @ApiProperty()
  @IsArray()
  authorizedUsers?: any[];
  @IsArray()
  @ApiProperty()
  authorizedRoles?: any[];
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  relations?: ObjectRelationDTO[];
}

export class MakeRelationDTO {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  entries: MakeRelationBody[];
}

export class MakeRelationBody {
  @IsString()
  @IsNotEmpty()
  objectName: string;
  @IsString()
  @IsNotEmpty()
  foreignKey: string;
  @IsString()
  @IsNotEmpty()
  relation: objectRelatiosType;
}

export class ObjectRelationDTO {
  @IsNotEmpty()
  @IsString()
  objectName: string;
  @IsNotEmpty()
  @IsString()
  type: string;
  @IsNotEmpty()
  @IsString()
  key: string;
}

export class ObjectAttrUpd extends ObjectAttrDef {
  @IsNotEmpty()
  @IsString()
  operation: updColumnUpdate;
}

export class ObjectUpdateDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  columns: ObjectAttrUpd[];
  @IsObject()
  configs: Partial<NewObjConfig>;
}

export class NewAttributeDTO {
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  attributes: ObjectAttrDef[];
}
