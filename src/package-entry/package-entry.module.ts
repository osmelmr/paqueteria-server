import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PackageEntryController } from './package-entry.controller.js';
import { PackageEntryService } from './package-entry.service.js';
import { PackageProcessorService } from './package-processor.service.js';

@Module({
    imports: [PrismaModule],
    controllers: [PackageEntryController],
    providers: [PackageEntryService, PackageProcessorService],
    exports: [PackageProcessorService],
})
export class PackageEntryModule { }
