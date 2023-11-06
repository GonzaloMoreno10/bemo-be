import { Test, TestingModule } from '@nestjs/testing';
import { DbObjectService } from './db-object.service';

describe('DbObjectService', () => {
  let service: DbObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbObjectService],
    }).compile();

    service = module.get<DbObjectService>(DbObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
