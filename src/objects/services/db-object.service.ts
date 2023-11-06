import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ObjectModel } from '../models/object.model';
import { SObject } from '../dtos/object.dto';

@Injectable()
export class DbObjectService {
  constructor(
    @InjectModel(ObjectModel) private objectModel: typeof ObjectModel,
  ) {}

  createObject(object: SObject) {
    return this.objectModel.create(object);
  }

  getObjects(object?: Partial<ObjectModel>) {
    return this.objectModel.findAll({ where: { ...object } });
  }

  getObject(object?: Partial<ObjectModel>) {
    object.enabled = true;
    return this.objectModel.findOne({ where: { ...object } });
  }

  getDescribe(model: string): Promise<ObjectModel> {
    return this.objectModel.findOne({
      where: { name: model },
      attributes: {
        exclude: ['objConfig', 'createdAt', 'updatedAt', 'id', 'enabled'],
      },
      raw: true,
    });
  }

  update(id: number, object) {
    object.updatedAt = new Date();
    return this.objectModel.update(object, { where: { id } });
  }
}
