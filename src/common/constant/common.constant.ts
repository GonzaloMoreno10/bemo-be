export const reservedFieldNames = [
  'createdAt',
  'updatedAt',
  'id',
  'deletedAt',
  'enabled',
  'createdUser',
  'updatedUser',
  'deletedUser',
];

export type rolType = 'admin' | 'creator' | 'consultor' | 'querier';

export const roles = {
  admin: 1,
  creator: 2,
  consultor: 3,
  querier: 4,
};
