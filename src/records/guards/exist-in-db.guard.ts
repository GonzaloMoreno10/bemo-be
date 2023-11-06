import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RecordService } from '../services/record.service';

@Injectable()
export class ExistInDbGuard implements CanActivate {
  constructor(@Inject(RecordService) private recordService: RecordService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { id, object } = context.switchToHttp().getRequest().params;
    if (id) {
      return this.existsInDB(id, object);
    }
    return true;
  }

  async existsInDB(id: number, object: string): Promise<boolean> {
    const exists = await this.recordService.getRegisterById(object, id);
    if (!exists) {
      throw new NotFoundException(`${object} with id ${id} not exist`);
    }
    return true;
  }
}
