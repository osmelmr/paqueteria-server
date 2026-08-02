import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { name: 'asc' },
      include: {
        drivers: { include: { driver: true } },
        _count: { select: { routes: true } },
      },
    });
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        drivers: { include: { driver: true } },
        routes: { take: 10, orderBy: { departureDate: 'desc' } },
      },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(data: { name: string; driverIds?: string[] }) {
    return this.prisma.vehicle.create({
      data: {
        name: data.name.toUpperCase().trim(),
        ...(data.driverIds?.length
          ? {
              drivers: {
                create: data.driverIds.map((driverId) => ({ driverId })),
              },
            }
          : {}),
      },
      include: { drivers: { include: { driver: true } } },
    });
  }

  async update(id: string, data: { name?: string; driverIds?: string[] }) {
    await this.findById(id);

    if (data.driverIds !== undefined) {
      await this.prisma.driverVehicle.deleteMany({ where: { vehicleId: id } });
      if (data.driverIds.length > 0) {
        await this.prisma.driverVehicle.createMany({
          data: data.driverIds.map((driverId) => ({ vehicleId: id, driverId })),
        });
      }
    }

    const updateData: any = {};
    if (data.name !== undefined)
      updateData.name = data.name.toUpperCase().trim();

    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: { drivers: { include: { driver: true } } },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.driverVehicle.deleteMany({ where: { vehicleId: id } });
    await this.prisma.vehicle.delete({ where: { id } });
  }
}
