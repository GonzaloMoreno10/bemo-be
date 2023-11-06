import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { RecordService } from './services/record.service';
import { RecordController } from './controllers/record.controller';
import { ObjectModule } from 'src/objects/object.module';
import { CommonModule } from 'src/common/common.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ObjectModel } from 'src/objects/models/object.model';

@Module({
  providers: [RecordService, ValidationService],
  imports: [
    ObjectModule,
    CommonModule,
    SequelizeModule.forFeature([ObjectModel]),
  ],
  exports: [RecordService, ValidationService],
  controllers: [RecordController],
})
export class RecordModule {}
