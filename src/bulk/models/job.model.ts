import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { jobStates } from '../constants/job.constant';

@Table({
  tableName: 'jobs',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  },
})
export class JobModel extends Model<JobModel> {
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
  })
  object: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'not charged',
  })
  filename: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: jobStates.created,
  })
  state: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  success: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  failed: number;
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  error: any;
}
