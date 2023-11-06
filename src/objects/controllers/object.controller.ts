import {
  Controller,
  HttpStatus,
  HttpCode,
  Body,
  Inject,
  Post,
  BadRequestException,
  Param,
  Get,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { NewObjectPipe } from '../pipes/new-object.pipe';
import {
  NewObjConfig,
  NewObjectDTO,
  ObjectAttrDef,
  SObject,
} from '../dtos/object.dto';
import { ObjectService } from '../services/object.service';
import { DbObjectService } from '../services/db-object.service';
import { RolGuard } from 'src/auth/guards/rol.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { roles } from 'src/common/constant/common.constant';
import { Roles } from 'src/common/decorators/rol.decorator';
import { Request } from 'express';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectModel } from '../models/object.model';
import { ExistObjectGuard } from '../guards/exist-object.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateObjectPipe } from '../pipes/update-object.pipe';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';
import { ConfigPipe } from '../pipes/config.pipe';

@ApiTags('object')
@UseGuards(JwtAuthGuard, RolGuard)
@Controller('sobject')
export class ObjectController {
  constructor(
    @Inject(DbObjectService) private dbObjectService: DbObjectService,
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  //*Create new DB object
  @ApiOperation({ summary: 'Create new DB Object' })
  @ApiResponse({ status: 201, description: 'Object created' })
  @Roles(roles.admin, roles.creator)
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async create(
    @Body(NewObjectPipe) newObj: NewObjectDTO,
    @Req() request: Request,
  ): Promise<any> {
    try {
      const userId = request.user['id'];
      if (newObj.configs.authorizedUsers) {
        if (!newObj.configs.authorizedUsers.includes(userId)) {
          newObj.configs.authorizedUsers.push(userId);
        }
      } else {
        newObj.configs.authorizedUsers = [userId];
      }

      const { model, config } = await this.objectService.createTable(newObj);

      await this.dbObjectService.createObject({
        name: newObj.name,
        object: model,
        objConfig: config,
        userAudit: newObj.configs.userAudit,
        auditFields: newObj.configs.auditFields,
        hasTrigger: newObj.configs.hasTrigger,
        delStrategy: newObj.configs.delStrategy,
        authorizedUsers: newObj.configs.authorizedUsers,
        deleteable: newObj.configs.deleteable,
        queryable: newObj.configs.queryable,
        authorizedRoles: newObj.configs.authorizedRoles,
        relations: newObj.relations,
        userId: userId,
      });

      return { code: 201, message: 'Model created' };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  //*Get db object description
  //@Public()
  @ApiOperation({ summary: 'Get DB Object description' })
  @UseGuards(ExistObjectGuard)
  @ApiOkResponse({ type: SObject })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/:object/describe')
  describe(@Param('object') object: string): Promise<ObjectModel> {
    return this.dbObjectService.getDescribe(object);
  }

  //@Public()
  @ApiOperation({ summary: 'Get DB Object description' })
  @ApiOkResponse({ type: SObject, isArray: true })
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/')
  all(): Promise<ObjectModel[]> {
    return this.dbObjectService.getObjects();
  }

  @UseGuards(ExistObjectGuard)
  @Post('/:object/attribute')
  async addAttribute(
    @Param('object') object: string,
    @Body('attributes', UpdateObjectPipe) attributes: ObjectAttrDef[],
  ) {
    try {
      const dbObject = await this.dbObjectService.getObject({ name: object });

      const modifyObj: ObjectModel = Object.assign(dbObject);

      for await (const attr of attributes) {
        try {
          await this.objectService.addColumn(attr, object);
          modifyObj.object[attr.name] = {
            field: attr.name,
            type:
              attr.type.toUpperCase() === 'VARCHAR'
                ? `${attr.type.toUpperCase()}(${attr.size})`
                : attr.type.toUpperCase(),
            allowNull: !attr.required,
            filterable: attr.filterable ?? false,
            sortable:
              attr.sortable ?? this.configService.tableConfig.default_sortable,
            unique: attr.unique,
            defaultValue: attr.defaultValue ?? undefined,
            updateable: attr.updateable ?? true,
          };
        } catch (err) {
          throw new BadRequestException();
        }
      }
      await this.dbObjectService.update(dbObject.id, {
        object: modifyObj.object,
      });
      return this.dbObjectService.getDescribe(object);
    } catch (err) {
      throw new BadRequestException('Error al actualizar el modelo');
    }
  }
  // @UseGuards(ExistObjectGuard)
  // @Put('/:object/attribute')
  // async updateAttribute(
  //   @Param('object') object: string,
  //   @Param('attribute') attrNamer: string,
  //   @Body('attributes', UpdateObjectPipe) attribute: ObjectAttrDef,
  // ) {}

  @Roles(roles.admin, roles.creator)
  @UseGuards(ExistObjectGuard)
  @Put('/:object/configs')
  async modifyConfig(
    @Param('object') object: string,
    @Body(ConfigPipe) config: Partial<NewObjConfig>,
  ) {
    try {
      const dbObject = await this.dbObjectService.getObject({ name: object });

      await this.dbObjectService.update(dbObject.id, config);

      return this.dbObjectService.getObject({ id: dbObject.id });
    } catch (err) {
      throw new BadRequestException('Error al actualizar configuraciones');
    }
  }
}
