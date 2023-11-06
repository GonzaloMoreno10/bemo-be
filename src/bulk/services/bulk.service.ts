import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobModel } from '../models/job.model';
import { parse } from 'csv-parse/sync';
import { ObjectService } from 'src/objects/services/object.service';
import { ModelCtor } from 'sequelize-typescript';
import { jobStates } from '../constants/job.constant';

@Injectable()
export class BulkService {
  constructor(
    @InjectModel(JobModel) private jobModel: typeof JobModel,
    @Inject(ObjectService) private objectService: ObjectService,
  ) {}

  create(object: string) {
    return this.jobModel.create({ object });
  }

  getById(id: number) {
    return this.jobModel.findOne({ where: { id } });
  }

  getByObject(object: string, state: number) {
    return this.jobModel.findOne({ where: { object, state } });
  }

  update(id: number, object: Partial<JobModel>) {
    object.updatedAt = new Date();
    return this.jobModel.update(object, { where: { id } });
  }

  async processFile(
    file: Express.Multer.File,
    object: string,
    id: number,
    userId: number,
  ) {
    try {
      const parsed = parse(file.buffer.toString('utf-8'), {
        columns: true,
        delimiter: ';',
      });

      const model: ModelCtor = await this.objectService.getModelSync(object);

      await this.update(id, { state: jobStates.finalized });
      const modAttr = await this.objectService.getAllAttModel(object);

      const promises = parsed.map((x: any) => {
        if (modAttr.includes('createdUser') && !x.createdUser) {
          x.createdUser = userId;
        }
        return model.create(x);
      });

      const errorsMessage = [];
      const result = await Promise.allSettled(promises);
      const success = result.filter((x) => x.status === 'fulfilled').length;
      const errors = result.length - success;
      result.map((x) => {
        if (x.status === 'rejected') {
          errorsMessage.push({ error: x.reason.parent?.sqlMessage });
        }
      });

      await this.update(id, {
        state: errors > 0 ? jobStates.error : jobStates.finalized,
        success,
        failed: errors,
        error: JSON.stringify(errorsMessage),
      });
      return { success, errors };
    } catch (err) {
      await this.update(id, {
        state: jobStates.error,
        success: 0,
        failed: 1,
        error: err.message,
      });
    }
  }
}
