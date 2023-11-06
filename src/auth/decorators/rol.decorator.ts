import { SetMetadata } from '@nestjs/common';

export const ROL_KEY = 'ROL';

export const Roles = (...roles: number[]) => SetMetadata(ROL_KEY, roles);
