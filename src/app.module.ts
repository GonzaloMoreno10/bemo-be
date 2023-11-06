import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { SequelizeModule } from '@nestjs/sequelize';
import config from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ModelsModule } from './models/models.module';
import { CommonModule } from './common/common.module';
import { ObjectModule } from './objects/object.module';
import { RecordModule } from './records/record.module';
import { QueryModule } from './queries/query.module';
import { BulkModule } from './bulk/bulk.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        DB_NAME: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        DEFAULT_USER_AUDIT: Joi.boolean().required(),
        DEFAULT_AUDIT_FIELDS: Joi.boolean().required(),
        DEFAULT_HAS_TRIGGER: Joi.boolean().required(),
        DEFAULT_DELETE_STRATEGIE: Joi.string().required(),
        DEFAULT_ALLOW_NULL: Joi.boolean().required(),
        DEFAULT_FILTERABLE: Joi.boolean().required(),
        DEFAULT_SORTABLE: Joi.boolean().required(),
        DEFAULT_DELETEABLE: Joi.boolean().required(),
        DEFAULT_UPDATEABLE: Joi.boolean().required(),
        DEFAULT_ROLES_ADMITED: Joi.required(),
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        logging: true,
        autoLoadModels: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      dest: './uploads', // Ruta donde se guardarán los archivos subidos
    }),
    HttpModule,
    CommonModule,
    ObjectModule,
    RecordModule,
    ModelsModule,
    QueryModule,
    BulkModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
