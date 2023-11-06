import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BulkService } from '../services/bulk.service';

@Injectable()
export class ExistJobGuard implements CanActivate {
  constructor(@Inject(BulkService) private bulkService: BulkService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { params } = context.switchToHttp().getRequest();
    if (!params.id) {
      throw new BadRequestException('Invalid job id');
    }
    return this.existJob(params.id);
  }

  async existJob(id: number) {
    const result = await this.bulkService.getById(id);
    if (result) {
      return true;
    }
    throw new BadRequestException(`Job with id ${id} not exist`);
  }
}
