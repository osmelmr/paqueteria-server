import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

const routeInclude = {
  vehicle: { include: { drivers: { include: { driver: true } } } },
  drivers: { include: { driver: true } },
  packages: {
    include: {
      hbls: true,
      recipient: true,
      guide: { include: { agency: true } },
      status: true,
      location: true,
    },
  },
};

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.route.findMany({
      orderBy: { departureDate: 'desc' },
      include: routeInclude,
    });
  }

  async findById(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: routeInclude,
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async create(data: {
    name: string;
    description?: string;
    departureDate?: string;
    vehicleId: string;
    hbls: string[];
    driverIds?: string[];
  }) {
    const hblRecords = await this.prisma.packageHbl.findMany({
      where: { hblCode: { in: data.hbls } },
      select: { packageId: true },
    });

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { drivers: { select: { driverId: true } } },
    });
    if (!vehicle) throw new BadRequestException('Vehículo no encontrado');

    const packageIds = [...new Set(hblRecords.map((h) => h.packageId))];

    const createData: any = {
      name: data.name.toUpperCase().trim(),
      description: data.description,
      vehicleId: data.vehicleId,
    };
    if (data.departureDate)
      createData.departureDate = new Date(data.departureDate);
    if (packageIds.length > 0)
      createData.packages = { connect: packageIds.map((id) => ({ id })) };

    let driverIds = data.driverIds;
    if (driverIds === undefined) {
      driverIds = vehicle.drivers.map((dv) => dv.driverId);
    }
    driverIds = [...new Set(driverIds)];
    await this.validateDrivers(driverIds);
    if (driverIds.length > 0) {
      createData.drivers = {
        create: driverIds.map((driverId) => ({ driverId })),
      };
    }

    return this.prisma.route.create({
      data: createData,
      include: routeInclude,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      departureDate?: string;
      vehicleId?: string;
      hbls?: string[];
      driverIds?: string[];
    },
  ) {
    const existing = await this.findById(id);

    const updateData: any = {};
    if (data.name !== undefined)
      updateData.name = data.name.toUpperCase().trim();
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.departureDate !== undefined)
      updateData.departureDate = new Date(data.departureDate);
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;

    if (data.hbls !== undefined) {
      const hblRecords = await this.prisma.packageHbl.findMany({
        where: { hblCode: { in: data.hbls } },
        select: { packageId: true },
      });
      const packageIds = [...new Set(hblRecords.map((h) => h.packageId))];
      updateData.packages = {
        set: packageIds.map((pid) => ({ id: pid })),
      };
    }

    if (
      data.vehicleId !== undefined &&
      data.vehicleId !== existing.vehicleId
    ) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
        include: { drivers: { select: { driverId: true } } },
      });
      if (!vehicle) throw new BadRequestException('Vehículo no encontrado');
      updateData.drivers = {
        deleteMany: {},
        create: vehicle.drivers.map((dv) => ({ driverId: dv.driverId })),
      };
    }

    if (data.driverIds !== undefined) {
      const driverIds = [...new Set(data.driverIds)];
      await this.validateDrivers(driverIds);
      updateData.drivers = {
        deleteMany: {},
        create: driverIds.map((driverId) => ({ driverId })),
      };
    }

    return this.prisma.route.update({
      where: { id },
      data: updateData,
      include: routeInclude,
    });
  }

  private async validateDrivers(driverIds: string[]) {
    if (driverIds.length === 0) return;
    const found = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true },
    });
    if (found.length !== driverIds.length) {
      throw new BadRequestException('Alguno de los conductores no existe');
    }
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.route.update({
      where: { id },
      data: { packages: { set: [] } },
    });
    await this.prisma.route.delete({ where: { id } });
  }
}
