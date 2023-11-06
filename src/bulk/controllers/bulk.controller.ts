import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExistObjectGuard } from 'src/objects/guards/exist-object.guard';
import { BulkService } from '../services/bulk.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { jobStates } from '../constants/job.constant';
import { ExistJobGuard } from '../guards/exist-job.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolGuard } from 'src/auth/guards/rol.guard';
import { Roles } from 'src/auth/decorators/rol.decorator';
import { roles } from 'src/common/constant/common.constant';
import { Request } from 'express';
import { FilePipe } from '../pipes/file.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bulk')
@UseGuards(JwtAuthGuard, RolGuard)
@Controller('/sobject/bulk')
export class BulkController {
  constructor(@Inject(BulkService) private bulkService: BulkService) {}

  //*Create new Bulk Job
  @Roles(roles.admin, roles.creator)
  @UseGuards(ExistObjectGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/:object/create')
  async createJob(@Param('object') object: string) {
    const existJob = await this.bulkService.getByObject(
      object,
      jobStates.created,
    );
    if (existJob) {
      throw new BadRequestException(
        `there is already a job in created state for the ${object} object`,
      );
    }
    return this.bulkService.create(object);
  }

  @Roles(roles.admin, roles.creator)
  //*Upload file to job with :id
  @UseGuards(ExistJobGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/job/:id/upload')
  async uploadFile(
    @UploadedFile('file', FilePipe) file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    try {
      const job = await this.bulkService.getById(id);

      if (job.state !== jobStates.created) {
        throw new BadRequestException(
          'The searched job is not in the created state',
        );
      }

      await this.bulkService.update(id, {
        state: jobStates.initiated,
        filename: file.originalname,
      });

      this.bulkService.processFile(file, job.object, id, request.user['id']);
      return { code: 'Accepted', message: 'File is processing' };
    } catch (err) {
      return (
        err.response ??
        new InternalServerErrorException(err.message).getResponse()
      );
    }
  }

  //*Obtain job by id
  @Roles(roles.admin, roles.creator, roles.consultor)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/job/:id/:format?')
  async getJobState(
    @Param('id', ParseIntPipe) id: number,
    @Param('format') format: string,
  ) {
    try {
      const result = await this.bulkService.getById(id);
      if (!result) {
        throw new NotFoundException('Job not found');
      }

      result.error = result.error ? JSON.parse(result.error) : [];
      if (format === 'errors') {
        return result.error;
      } else {
        delete result.dataValues.error;
        return result;
      }
    } catch (err) {
      return (
        err.response ??
        new InternalServerErrorException(err.message).getResponse()
      );
    }
  }
}
