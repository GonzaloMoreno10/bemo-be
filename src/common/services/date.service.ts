import * as moment from 'moment-timezone';

export const fechaAlta = moment().tz('America/Rosario').toDate();

export const parseBoolean = (string: string) => {
  return string.toLowerCase() === 'true';
};
