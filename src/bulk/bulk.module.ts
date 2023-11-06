import { Module } from '@nestjs/common';
import { BulkService } from './services/bulk.service';
import { JobModel } from './models/job.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { BulkController } from './controllers/bulk.controller';
import { ObjectModule } from 'src/objects/object.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  providers: [BulkService],
  exports: [BulkService],
  imports: [SequelizeModule.forFeature([JobModel]), ObjectModule, CommonModule],
  controllers: [BulkController],
})
export class BulkModule {}
