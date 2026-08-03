import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AgenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agency.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const agency = await this.prisma.agency.findUnique({ where: { id } });
    if (!agency) throw new NotFoundException('Agency not found');
    return agency;
  }

  async create(name: string) {
    return this.prisma.agency.create({ data: { name } });
  }

  async update(id: string, name?: string) {
    await this.findById(id);
    return this.prisma.agency.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.agency.delete({ where: { id } });
  }
}
