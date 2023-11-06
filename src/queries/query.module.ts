import { Module } from '@nestjs/common';
import { QueryController } from './controllers/query.controller';
import { QueryService } from './services/query.service';
import { ObjectModule } from 'src/objects/object.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ObjectModel } from 'src/objects/models/object.model';

@Module({
  controllers: [QueryController],
  providers: [QueryService],
  imports: [ObjectModule, SequelizeModule.forFeature([ObjectModel])],
})
export class QueryModule {}
