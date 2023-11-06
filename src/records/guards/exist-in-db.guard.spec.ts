import { ExistInDbGuard } from './exist-in-db.guard';

describe('ExistInDbGuard', () => {
  it('should be defined', () => {
    expect(new ExistInDbGuard()).toBeDefined();
  });
});
