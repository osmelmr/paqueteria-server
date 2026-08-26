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
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(
    private packages: PackagesService,
    private packageHistory: PackageHistoryService,
  ) {}

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('provinceId') provinceId?: string,
    @Query('provinceIds') provinceIds?: string,
    @Query('municipeId') municipeId?: string,
    @Query('header') header?: string,
    @Query('hbl') hbl?: string,
    @Query('recipientId') recipientId?: string,
    @Query('guideId') guideId?: string,
    @Query('idCard') idCard?: string,
    @Query('alert') alert?: string,
    @Query('statusDate') statusDate?: string,
    @Query('locationId') locationId?: string,
    @Query('agencyId') agencyId?: string,
    @Query('guideType') guideType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (guideType && !['AEREA', 'MARITIMA'].includes(guideType)) {
      throw new BadRequestException('guideType inválido');
    }
    // Validar y convertir a números
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;

    // Validar límites razonables
    if (pageNumber < 1) {
      throw new BadRequestException('page debe ser mayor a 0');
    }
    if (limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('limit debe estar entre 1 y 100');
    }
    return this.packages.findAll({
      status,
      provinceId,
      provinceIds: provinceIds
        ? provinceIds.split(',').filter(Boolean)
        : undefined,
      municipeId,
      header: header !== undefined ? header === 'true' : undefined,
      hbl,
      recipientId,
      guideId,
      idCard,
      alert: alert !== undefined ? alert === 'true' : undefined,
      statusDate: statusDate || undefined,
      locationId: locationId || undefined,
      agencyId: agencyId || undefined,
      guideType: (guideType || undefined) as 'AEREA' | 'MARITIMA',
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Get('by-hbl/:hbl')
  findByHbl(@Param('hbl') hbl: string) {
    return this.packages.findByHbl(hbl);
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packages.findById(id);
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.packageHistory.history(id);
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Post('check-hbls')
  checkHbls(@Body() body: { hbls?: string[] }) {
    const hbls = Array.isArray(body?.hbls) ? body.hbls : [];
    if (hbls.length === 0) {
      throw new BadRequestException('Debe enviar al menos un HBL');
    }
    return this.packages.checkHbls(hbls);
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Post()
  create(@Body() dto: CreatePackageDto) {
    return this.packages.create(dto);
  }

  @Roles('ADMIN', 'OWNER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packages.update(id, dto);
  }

  @Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePackageStatusDto) {
    return this.packages.updateStatus(
      id,
      dto.statusId,
      dto.locationId,
      dto.statusDate,
    );
  }

  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.packages.delete(id);
  }
}
