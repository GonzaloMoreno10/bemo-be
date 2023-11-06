import { SetMetadata } from '@nestjs/common';

export const MODEL_KEY = 'Model';

export const Model = (model: string) => SetMetadata(MODEL_KEY, model);
