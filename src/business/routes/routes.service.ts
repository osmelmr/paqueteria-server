import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

const routeInclude = {
  vehicle: { include: { drivers: { include: { driver: true } } } },
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
  }) {
    const hblRecords = await this.prisma.packageHbl.findMany({
      where: { hblCode: { in: data.hbls } },
      select: { packageId: true },
    });

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
    },
  ) {
    await this.findById(id);

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

    return this.prisma.route.update({
      where: { id },
      data: updateData,
      include: routeInclude,
    });
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
