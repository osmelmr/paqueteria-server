import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreatePackageDto } from './dto/create-package.dto.js';
import { UpdatePackageDto } from './dto/update-package.dto.js';
import { UpdatePackageStatusDto } from './dto/update-package-status.dto.js';
import { PackagesService } from './services/packages-crud.service.js';
import { PackageHistoryService } from './services/package-history.service.js';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(
    private packages: PackagesService,
    private packageHistory: PackageHistoryService,
  ) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('provinceId') provinceId?: string,
    @Query('provinceIds') provinceIds?: string,
    @Query('municipeId') municipeId?: string,
    @Query('hbl') hbl?: string,
    @Query('recipientId') recipientId?: string,
    @Query('guideId') guideId?: string,
    @Query('search') search?: string,
    @Query('alert') alert?: string,
    @Query('statusDate') statusDate?: string,
    @Query('locationId') locationId?: string,
    @Query('agencyId') agencyId?: string,
    @Query('guideType') guideType?: string,
  ) {
    if (guideType && !['AEREA', 'MARITIMA'].includes(guideType)) {
      throw new BadRequestException('guideType inválido');
    }
    return this.packages.findAll({
      status,
      provinceId,
      provinceIds: provinceIds
        ? provinceIds.split(',').filter(Boolean)
        : undefined,
      municipeId,
      hbl,
      recipientId,
      guideId,
      search,
      alert: alert !== undefined ? alert === 'true' : undefined,
      statusDate: statusDate || undefined,
      locationId: locationId || undefined,
      agencyId: agencyId || undefined,
      guideType: (guideType || undefined) as 'AEREA' | 'MARITIMA',
    });
  }

  @Get('by-hbl/:hbl')
  findByHbl(@Param('hbl') hbl: string) {
    return this.packages.findByHbl(hbl);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packages.findById(id);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.packageHistory.history(id);
  }

  @Post()
  create(@Body() dto: CreatePackageDto) {
    return this.packages.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packages.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePackageStatusDto) {
    return this.packages.updateStatus(id, dto.statusId, dto.locationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.packages.delete(id);
  }
}
