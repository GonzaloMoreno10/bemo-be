export interface IUser extends ICommonFields {
  id?: number;
  nombre: string;
  apellido: string;
  mail: string;
  password: string;
  rol: number;
}

export interface ICommonFields {
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  creation_user?: number;
  update_user?: number;
  delete_user?: number;
  enabled?: boolean;
}
