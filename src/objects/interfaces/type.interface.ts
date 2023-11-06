export interface IType {
  name: string;
  object: ITypeAttributes[];
}

export interface ITypeAttributes {
  key: string;
  type: string;
}
