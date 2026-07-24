import {
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
import { PackagesService } from './packages.service.js';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(private packages: PackagesService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('provinceId') provinceId?: string,
    @Query('isOrphan') isOrphan?: string,
    @Query('hbl') hbl?: string,
    @Query('recipientId') recipientId?: string,
    @Query('guideId') guideId?: string,
    @Query('search') search?: string,
  ) {
    return this.packages.findAll({
      status,
      provinceId,
      isOrphan: isOrphan !== undefined ? isOrphan === 'true' : undefined,
      hbl,
      recipientId,
      guideId,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packages.findById(id);
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
