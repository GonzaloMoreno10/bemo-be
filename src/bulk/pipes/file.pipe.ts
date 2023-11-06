import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FilePipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file) {
      if (file.mimetype !== 'text/csv' && file.originalname.includes('.csv')) {
        throw new BadRequestException('Invalid file');
      }

      //*Max size 900KB
      if (file.size / 1024 > 900) {
        throw new BadRequestException('File is too heavy');
      }
    } else {
      throw new BadRequestException('Invalid File');
    }
    return file;
  }
}
