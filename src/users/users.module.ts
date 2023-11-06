import { Module } from '@nestjs/common';
import { UsersController } from 'src/users/controllers/users.controller';
import { UsersSevice } from 'src/users/services/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersSevice],
  exports: [UsersSevice],
})
export class UsersModule {}
