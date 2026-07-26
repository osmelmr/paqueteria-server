import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { normalizeText } from '../../common/utils/normalize-text.js';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async create(name: string) {
    return this.prisma.location.create({ data: { name: normalizeText(name) } });
  }

  async update(id: string, data: { name?: string }) {
    await this.findById(id);
    const normalized = data.name ? { ...data, name: normalizeText(data.name) } : data;
    return this.prisma.location.update({ where: { id }, data: normalized });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.location.delete({ where: { id } });
  }
}
