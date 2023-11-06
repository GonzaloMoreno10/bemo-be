import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { roles } from 'src/common/constant/common.constant';
import { deleteStrategy } from '../constants/object.constant';

@Table({
  tableName: 'objects',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
  },
})
export class ObjectModel extends Model<ObjectModel> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: 'object-unique',
  })
  name: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  object: any;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  relations: any;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'object-unique',
  })
  userId: number;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    unique: 'object-unique',
  })
  enabled: boolean;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  auditFields: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: deleteStrategy.logic,
  })
  delStrategy: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  hasTrigger: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  userAudit: boolean;
  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  objConfig: any;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  deleteable: boolean;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  updateable: boolean;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  queryable: boolean;
  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  authorizedUsers: string[];
  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [roles.admin],
  })
  authorizedRoles: string[];
}
