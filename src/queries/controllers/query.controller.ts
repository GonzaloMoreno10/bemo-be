import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryService } from '../services/query.service';
import { QueryPipe } from '../pipes/query.pipe';
import { QueryGuard } from '../guard/query.guard';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolGuard } from 'src/auth/guards/rol.guard';

@ApiTags('query')
@Controller('/sobject/query')
@UseGuards(JwtAuthGuard, RolGuard)
export class QueryController {
  constructor(@Inject(QueryService) private queryService: QueryService) {}
  @UseGuards(QueryGuard)
  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  async query(@Query('q', QueryPipe) query: string) {
    try {
      const result = await this.queryService.getQuery(query);
      if (result.length > 0) {
        return result;
      }
      throw new NotFoundException('No records found');
    } catch (err) {
      return (
        err.response ??
        new InternalServerErrorException(err.message).getResponse()
      );
    }
  }
}
