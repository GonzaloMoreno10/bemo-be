import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ timestamps: true })
export class User extends Model<User> {
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
  nombre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  apellido: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: 'user-unique',
  })
  mail: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rol: number;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    unique: 'user-unique',
  })
  enabled: boolean;
}
