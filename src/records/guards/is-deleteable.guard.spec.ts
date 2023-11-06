import { IsDeleteableGuard } from './is-deleteable.guard';

describe('IsDeleteableGuard', () => {
  it('should be defined', () => {
    expect(new IsDeleteableGuard()).toBeDefined();
  });
});
