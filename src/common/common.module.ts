import { Global, Module } from '@nestjs/common';
import { PackageWriterService } from './package-writer.service.js';

@Global()
@Module({
  providers: [PackageWriterService],
  exports: [PackageWriterService],
})
export class CommonModule {}
