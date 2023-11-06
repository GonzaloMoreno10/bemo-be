import { Global, Module } from '@nestjs/common';
import { JobModel } from 'src/bulk/models/job.model';
import { ObjectModel } from 'src/objects/models/object.model';
@Global()
@Module({
  providers: [
    {
      provide: 'MODELS',
      useValue: [ObjectModel, JobModel],
    },
  ],
  exports: ['MODELS'],
})
export class ModelsModule {}
