import { Module } from '@nestjs/common';
import { ObjectService } from './services/object.service';
import { DbObjectService } from './services/db-object.service';
import { ObjectController } from './controllers/object.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ObjectModel } from './models/object.model';
import { ResponseService } from 'src/common/services/response.service';
import { ValidService } from './services/valid.service';

@Module({
  providers: [ObjectService, DbObjectService, ResponseService, ValidService],
  exports: [ObjectService, DbObjectService],
  imports: [SequelizeModule.forFeature([ObjectModel])],
  controllers: [ObjectController],
})
export class ObjectModule {}
