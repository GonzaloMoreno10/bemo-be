export const AttTypes = [
  'VARCHAR',
  'BOOLEAN',
  'INTEGER',
  'FLOAT',
  'DATE',
  'TIMESTAMP',
  'BIGINT',
  'DECIMAL',
];

export type deleteStrategy = 'LOGICAL' | 'PHISICAL';

export const deleteStrategy = {
  logic: 'LOGICAL',
  fisic: 'PHISICAL',
};

export const commonAttributes = [
  'updatedAt',
  'createdAt',
  'deletedAt',
  'createdUser',
  'deletedUser',
  'updatedUser',
  'id',
  'enabled',
];

export type objectRelatiosType = 'hasOne' | 'hasMany';

export const objectRelations = [
  'hasOne',
  'hasMany',
  'belongsTo',
  'belongsToMany',
];
