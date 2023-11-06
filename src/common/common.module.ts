import { Module } from '@nestjs/common';
import { CommonService } from './services/common.service';
import { ResponseService } from './services/response.service';

@Module({
  providers: [CommonService, ResponseService],
  exports: [CommonService, ResponseService],
})
export class CommonModule {}
