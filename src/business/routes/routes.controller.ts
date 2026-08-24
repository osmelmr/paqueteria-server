import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';
import { CreateRouteDto } from './dto/create-route.dto.js';
import { UpdateRouteDto } from './dto/update-route.dto.js';
import { VehiclesService } from './vehicles.service.js';
import { DriversService } from './drivers.service.js';
import { RoutesService } from './routes.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller()
@Roles('ADMIN', 'OWNER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutesController {
  constructor(
    private vehicles: VehiclesService,
    private drivers: DriversService,
    private routes: RoutesService,
  ) {}

  // ── Vehicles ─────────────────────────────────────

  @Get('vehicles')
  findAllVehicles() {
    return this.vehicles.findAll();
  }

  @Get('vehicles/:id')
  findOneVehicle(@Param('id') id: string) {
    return this.vehicles.findById(id);
  }

  @Post('vehicles')
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Patch('vehicles/:id')
  updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, dto);
  }

  @Delete('vehicles/:id')
  async removeVehicle(@Param('id') id: string) {
    await this.vehicles.delete(id);
  }

  // ── Drivers ──────────────────────────────────────

  @Get('drivers')
  findAllDrivers() {
    return this.drivers.findAll();
  }

  @Get('drivers/:id')
  findOneDriver(@Param('id') id: string) {
    return this.drivers.findById(id);
  }

  @Post('drivers')
  createDriver(@Body() dto: CreateDriverDto) {
    return this.drivers.create(dto);
  }

  @Patch('drivers/:id')
  updateDriver(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.drivers.update(id, dto);
  }

  @Delete('drivers/:id')
  async removeDriver(@Param('id') id: string) {
    await this.drivers.delete(id);
  }

  // ── Routes ───────────────────────────────────────

  @Get('routes')
  findAllRoutes() {
    return this.routes.findAll();
  }

  @Get('routes/:id')
  findOneRoute(@Param('id') id: string) {
    return this.routes.findById(id);
  }

  @Post('routes')
  createRoute(@Body() dto: CreateRouteDto) {
    return this.routes.create(dto);
  }

  @Patch('routes/:id')
  updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routes.update(id, dto);
  }

  @Delete('routes/:id')
  async removeRoute(@Param('id') id: string) {
    await this.routes.delete(id);
  }
}
