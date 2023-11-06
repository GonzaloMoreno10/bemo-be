import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecordService } from '../services/record.service';
import { ResponseService } from 'src/common/services/response.service';
import { ExistObjectPipe } from 'src/objects/pipes/exist-object.pipe';
import { QueriesGuard } from '../guards/queries.guard';
import { ParseIntegerPipe } from 'src/objects/pipes/parse-integer.pipe';
import { ExistInDbGuard } from '../guards/exist-in-db.guard';
import { BodyGuard } from '../guards/body-guard.guard';
import { BodyUpdateGuard } from '../guards/body-update.guard';
import { ExistObjectGuard } from 'src/objects/guards/exist-object.guard';
import { Roles } from 'src/auth/decorators/rol.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolGuard } from 'src/auth/guards/rol.guard';
import { roles } from 'src/common/constant/common.constant';
import { IsDeleteableGuard } from '../guards/is-deleteable.guard';
import { TableUsersPermisionGuard } from 'src/common/guards/table-users-permision.guard';
import { CompositeRequestDTO } from '../dtos/composite.dto';
import { CompositeBodyGuard } from '../guards/composite-body.guard';
import { CompositeBodyInterceptor } from '../interceptors/composite-body.interceptor';
import { BodyUsersInterceptor } from 'src/common/interceptors/body-users.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('records')
@UseGuards(JwtAuthGuard, RolGuard)
@Controller('/sobject/records')
export class RecordController {
  constructor(
    @Inject(RecordService) private recordService: RecordService,
    @Inject(ResponseService) private responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ExistObjectGuard, TableUsersPermisionGuard, BodyGuard)
  @UseInterceptors(BodyUsersInterceptor)
  @Post('/:object')
  async create(
    @Param('object', ExistObjectPipe) object: string,
    @Body() body: any,
  ) {
    try {
      const result = await this.recordService.createRegisters(object, body);
      return result;
    } catch (err) {
      const error = this.responseService.handleDbError(err);
      throw new UnprocessableEntityException(error);
    }
  }

  //*Get table content
  @Roles(roles.admin, roles.creator, roles.consultor, roles.querier)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ExistObjectGuard, TableUsersPermisionGuard, QueriesGuard)
  @Get('/:object/:id?')
  async get(
    @Query() queries: any,
    @Param('object') object: string,
    @Param('id', ParseIntegerPipe) id?: number,
  ) {
    try {
      let result: any;
      if (id !== undefined) {
        result = await this.recordService.getRegisterById(object, id);
      } else {
        result = await this.recordService.getRegisters(object, queries);
      }

      if (!result || result.length == 0) {
        throw new NotFoundException('No records found');
      }
      return result;
    } catch (err) {
      console.log(err);
      return (
        err.response ??
        new InternalServerErrorException(err.message).getResponse()
      );
    }
  }

  //*Delete table content
  @Roles(roles.admin, roles.creator, roles.consultor)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(
    ExistObjectGuard,
    TableUsersPermisionGuard,
    IsDeleteableGuard,
    ExistInDbGuard,
  )
  @UseInterceptors(BodyUsersInterceptor)
  @Delete('/:object/:id')
  async delete(
    @Param('object') object: string,
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    try {
      const userId = request.user['id'];
      const result = await this.recordService.deleteRegister(
        object,
        id,
        userId,
      );
      if (result[0] >= 1) {
        return {
          code: 202,
          message: `${object} with id ${id} as deleted`,
          detail: 'deleted',
        };
      } else {
        throw new BadRequestException(`${object} with id: ${id} has not found`);
      }
    } catch (err) {
      const error = this.responseService.handleDbError(err);
      throw new UnprocessableEntityException(error ?? err.message);
    }
  }

  @Roles(roles.admin, roles.creator, roles.consultor)
  @UseGuards(
    ExistObjectGuard,
    TableUsersPermisionGuard,
    ExistInDbGuard,
    BodyUpdateGuard,
  )
  @UseInterceptors(BodyUsersInterceptor)
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/:object/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Param('object') object: string,
    @Body() body: any,
  ) {
    try {
      const result = await this.recordService.update(object, body, id);
      if (result.length > 0) {
        return this.recordService.getRegisterById(object, id);
      }
      throw new Error('No rows updated');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(CompositeBodyGuard)
  @Roles(roles.admin, roles.creator, roles.consultor)
  @UseInterceptors(CompositeBodyInterceptor)
  @Patch('/composite')
  async composite(@Body() compositeBody: CompositeRequestDTO) {
    try {
      const result = await this.recordService.sendComposite(compositeBody);
      return result;
    } catch (err) {
      throw new UnprocessableEntityException(err).getResponse();
    }
  }
}
