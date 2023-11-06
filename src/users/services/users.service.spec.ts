import { Test, TestingModule } from '@nestjs/testing';
import { UsersSevice } from './users.service';

describe('UsersService', () => {
  let service: UsersSevice;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersSevice],
    }).compile();

    service = module.get<UsersSevice>(UsersSevice);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
