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
  Req,
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
import type { Request } from 'express';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER', 'WORKER', 'STOREKEEPER', 'AGENT')
export class PackagesController {
  constructor(
    private packages: PackagesService,
    private packageHistory: PackageHistoryService,
  ) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('statusIds') statusIds?: string,
    @Query('provinceId') provinceId?: string,
    @Query('provinceIds') provinceIds?: string,
    @Query('municipeId') municipeId?: string,
    @Query('municipeIds') municipeIds?: string,
    @Query('header') header?: string,
    @Query('hbl') hbl?: string,
    @Query('recipientId') recipientId?: string,
    @Query('guideId') guideId?: string,
    @Query('guideIds') guideIds?: string,
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
      statusIds: statusIds ? statusIds.split(',').filter(Boolean) : undefined,
      provinceId,
      provinceIds: provinceIds
        ? provinceIds.split(',').filter(Boolean)
        : undefined,
      municipeId,
      municipeIds: municipeIds
        ? municipeIds.split(',').filter(Boolean)
        : undefined,
      header: header !== undefined ? header === 'true' : undefined,
      hbl,
      recipientId,
      guideId,
      guideIds: guideIds ? guideIds.split(',').filter(Boolean) : undefined,
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

  @Roles('ADMIN', 'OWNER', 'AGENT')
  @Post('bulk-create')
  bulkCreate(
    @Body() body: { hbls: string[]; statusId: string; locationId: string },
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.packages.bulkCreate(
      body.hbls,
      body.statusId,
      body.locationId,
      userId,
    );
  }

  @Get('by-hbl/:hbl')
  findByHbl(@Param('hbl') hbl: string) {
    return this.packages.findByHbl(hbl);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packages.findById(id);
  }

  @Roles('ADMIN', 'OWNER', 'AGENT', 'WORKER', 'STOREKEEPER')
  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.packageHistory.history(id);
  }

  @Roles('ADMIN')
  @Delete(':id/history/:historyId')
  removeHistory(
    @Param('id') id: string,
    @Param('historyId') historyId: string,
  ) {
    return this.packageHistory.remove(id, historyId);
  }

  @Post('check-hbls')
  checkHbls(@Body() body: { hbls?: string[] }) {
    const hbls = Array.isArray(body?.hbls) ? body.hbls : [];
    if (hbls.length === 0) {
      throw new BadRequestException('Debe enviar al menos un HBL');
    }
    return this.packages.checkHbls(hbls);
  }

  @Post()
  create(@Body() dto: CreatePackageDto, @Req() req: Request) {
    const userId = req.user!.id;
    return this.packages.create(dto, userId);
  }

  @Roles('ADMIN', 'OWNER', 'AGENT')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.packages.update(id, dto, userId);
  }

  @Roles('ADMIN', 'OWNER', 'AGENT', 'WORKER', 'STOREKEEPER')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePackageStatusDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.packages.updateStatus(
      id,
      dto.statusId,
      dto.locationId,
      dto.statusDate,
      userId,
    );
  }

  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.packages.delete(id);
  }
}
