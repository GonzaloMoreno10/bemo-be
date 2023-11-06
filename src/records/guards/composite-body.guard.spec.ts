import { CompositeBodyGuard } from './composite-body.guard';

describe('CompositeBodyGuard', () => {
  it('should be defined', () => {
    expect(new CompositeBodyGuard()).toBeDefined();
  });
});
