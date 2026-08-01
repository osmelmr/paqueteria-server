import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.driver.findMany({
      orderBy: { name: 'asc' },
      include: { vehicles: { include: { vehicle: true } } },
    });
  }

  async findById(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { vehicles: { include: { vehicle: true } } },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async create(data: { name: string }) {
    return this.prisma.driver.create({
      data: { name: data.name.toUpperCase().trim() },
    });
  }

  async update(id: string, data: { name?: string }) {
    await this.findById(id);
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.toUpperCase().trim();
    return this.prisma.driver.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.driverVehicle.deleteMany({ where: { driverId: id } });
    await this.prisma.driver.delete({ where: { id } });
  }
}
