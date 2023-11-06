import * as Joi from 'joi';
import { CompositeDTO } from '../dtos/composite.dto';

export const bodyCompositeValid = Joi.object<CompositeDTO>({
  object: Joi.string().min(2).required(),
  records: Joi.array().min(1).required(),
  upsert: Joi.boolean(),
  updateColumnName: Joi.string(),
});
