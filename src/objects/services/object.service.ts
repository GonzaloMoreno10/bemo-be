import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ObjectModel } from '../models/object.model';
import { commonAttributes } from '../constants/object.constant';
import { ModelCtor } from 'sequelize-typescript';
import {
  MakeRelationBody,
  NewObjectDTO,
  ObjectAttrDef,
} from '../dtos/object.dto';
import { DbObjectService } from './db-object.service';
import { ConfigType } from '@nestjs/config';
import config from 'src/config';
import { deleteStrategy } from '../constants/object.constant';

@Injectable()
export class ObjectService {
  constructor(
    @InjectModel(ObjectModel) private objectModel: typeof ObjectModel,
    @Inject(DbObjectService) private dbObjService: DbObjectService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  async createTable(type: NewObjectDTO) {
    const model: any = {};

    //*Load model properties
    type.properties.forEach((x: ObjectAttrDef) => {
      const mod = {};
      model[x.name] = mod[x.name] = {
        type:
          x.type.toUpperCase() === 'VARCHAR'
            ? `${x.type.toUpperCase()}(${x.size})`
            : x.type.toUpperCase(),
        allowNull: !x.required,
        filterable:
          x.filterable ?? this.configService.tableConfig.default_filterable,
        sortable: x.sortable ?? this.configService.tableConfig.default_sortable,
        updateable:
          x.updateable ?? this.configService.tableConfig.default_updateable,
        unique: x.unique
          ? type.configs.delStrategy === deleteStrategy.logic
            ? `${type.name}-enabled-unique`
            : `${x.name}-unique`
          : type.compositeUnique?.includes(x.name)
          ? `${type.name}-compositeUnique`
          : undefined,
        defaultValue: x.defaultValue ?? undefined,
      };

      return mod;
    });

    //*If delete strategy is Logical add corresponding fields
    if (!type.configs.delStrategy) {
      type.configs.delStrategy = 'LOGICAL';
    }
    if (type.configs.delStrategy === deleteStrategy.logic) {
      model['deletedAt'] = {
        type: 'DATETIME',
        allowNull: true,
      };
      model['enabled'] = {
        type: 'BOOLEAN',
        defaultValue: true,
        unique: type.compositeUnique
          ? `${type.name}-compositeUnique`
          : type.properties.filter((x: ObjectAttrDef) => x.unique).length > 0
          ? `${type.name}-enabled-unique`
          : undefined,
      };
      model['deletedUser'] = { type: 'INTEGER', allowNull: true };
    }

    //*User audit table fields
    if (type.configs.userAudit) {
      model['createdUser'] = { type: 'INTEGER', allowNull: false };
      model['updatedUser'] = { type: 'INTEGER', allowNull: true };
    }

    //*Load model configs
    const config = {
      timestamps: type.configs.auditFields ?? false,
      freezeTableName: true,
      hasTrigger: type.configs.hasTrigger ?? false,
      charset: 'utf8mb4', // Establecer el encoding a utf8
      collate: 'utf8mb4_0900_ai_ci', // Establecer el collate a utf8_general_ci
    };

    const configToReturn = { ...config };

    try {
      //*Define model
      const miModel = this.objectModel.sequelize.define(
        type.name,
        model,
        config,
      );

      if (type.relations) {
        for (const relation of type.relations) {
          const model = await this.getModelSync(relation.objectName);
          miModel[relation.type](model, { foreignKey: relation.key });
        }
      }

      console.log(miModel.associations);
      //*Sinchronize
      await miModel.sync({ force: false });

      return {
        model,
        config: configToReturn,
      };
    } catch (err) {
      throw new InternalServerErrorException('Error al crear el modelo');
    }
  }

  async addColumn(property: ObjectAttrDef, object: string) {
    try {
      let query = `${property.name} ${property.type}`;
      if (property.type.toUpperCase() === 'VARCHAR')
        query += `(${property.size})`;
      if (property.required) query += ` not null`;
      if (property.defaultValue) query += ` default '${property.defaultValue}'`;
      await this.objectModel.sequelize.query(
        `alter table ${object} add column ${query}`,
      );
    } catch (err) {
      throw new BadRequestException('Error al modificar el modelo');
    }
  }

  //!TODO Validar con otros motores
  async existsTable(name: string) {
    const result = await this.objectModel.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = '${name}' AND TABLE_SCHEMA = 'powerfull-api'`,
    );

    return result[0][0];
  }

  async existObject(name: string): Promise<boolean> {
    const object = await this.dbObjService.getObject({ name });
    if (object) {
      const table = await this.existsTable(name);
      if (table) {
        return true;
      }
    }
    return false;
  }

  async getModel(model: string): Promise<any> {
    const obj: ObjectModel = await this.dbObjService.getObject({ name: model });

    const miModel = this.objectModel.sequelize.define(
      obj.name,
      obj.object,
      obj.objConfig,
    );

    return miModel.getAttributes();
  }

  async getRequiredAttModel(model: string) {
    const miModel: ModelCtor = await this.getModelSync(model);

    return Object.entries(miModel.getAttributes())
      .map((x) => x[1])
      .filter(
        (x) =>
          !commonAttributes.includes(x.field) &&
          !x.allowNull &&
          x.defaultValue === undefined,
      );
  }

  async getAttModel(model: string) {
    const miModel: ModelCtor = await this.getModelSync(model);

    return Object.entries(miModel.getAttributes())
      .map((x) => x[1])
      .filter((x) => !commonAttributes.includes(x.field));
  }

  async getAllAttModel(model: string) {
    const miModel: ModelCtor = await this.getModelSync(model);
    if (miModel) {
      return Object.entries(miModel.getAttributes()).map((x) => x[1].field);
    }
  }

  async getSorteableAttrModel(model: string, array = false): Promise<any> {
    const miModel: ModelCtor = await this.getModelSync(model);
    const filtered = Object.entries(miModel.getAttributes())
      .map((x) => x[1])
      .filter((x) => x['sortable']);
    if (array) {
      return filtered.map((x) => x.field);
    }
    return filtered;
  }

  async getUpdateableAttrModel(model: string, array = false) {
    const miModel: ModelCtor = await this.getModelSync(model);
    const filtered = Object.entries(miModel.getAttributes())
      .map((x) => x[1])
      .filter((x) => x['updateable']);
    if (array) {
      return filtered.map((x) => x.field);
    }
    return filtered;
  }

  async getFIlterableAttr(model: string) {
    const miModel = await this.getModelSync(model);

    return Object.entries(miModel.getAttributes())
      .map((x) => x[1])
      .filter((x) => x['filterable']);
  }

  async getModelSync(model: string): Promise<any> {
    const obj: ObjectModel = await this.dbObjService.getObject({ name: model });
    if (obj) {
      const thisModel = this.objectModel.sequelize.define(
        obj.name,
        obj.object,
        obj.objConfig,
      );
      if (obj.relations) {
        const mapped = obj.relations.map((x: any) => Object.values(x));
        for (const map of mapped) {
          const obj1: ObjectModel = await this.dbObjService.getObject({
            name: map[2],
          });

          if (obj1) {
            const mod = this.objectModel.sequelize.define(
              obj1.name,
              obj1.object,
              obj1.objConfig,
            );
            thisModel[map[1]](mod, { foreignKey: map[0] });
          }
        }
      }

      await thisModel.sync({ force: false });

      return thisModel;
    }
  }

  async makeRelation(object: string, relation: MakeRelationBody) {
    const model: ModelCtor = await this.getModelSync(object);
    const desModel: ModelCtor = await this.getModelSync(relation.objectName);
    model[relation.relation](desModel, {
      foreignKey: relation.foreignKey,
      sourceKey: 'id',
    });
    const asociaciones = model.associations;
    const relaciones = {};
    await model.sync({ force: false });
    Object.keys(model.associations).forEach((name) => {
      relaciones[name] = {
        type: asociaciones[name].associationType,
        objectiveModel: asociaciones[name].target.name,
        foreignKey: asociaciones[name].foreignKey,
        primaryKey: asociaciones[name].source.primaryKeyAttribute,
        alias: asociaciones[name].as,
      };
    });

    console.log(relaciones);
    return relaciones;
  }
}
