import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { BatchPackageEntryDto } from './dto/batch-package-entry.dto.js';
import { SinglePackageEntryDto } from './dto/single-package-entry.dto.js';
import { PackageEntryService } from './package-entry.service.js';

@Controller('package-entry')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackageEntryController {
  constructor(private readonly packageEntryService: PackageEntryService) {}

  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  createSingle(@Body() dto: SinglePackageEntryDto) {
    return this.packageEntryService.createEntry(dto);
  }

  @Post()
  create(@Body() dto: BatchPackageEntryDto) {
    return this.packageEntryService.processBatch(dto.packages);
  }
}
