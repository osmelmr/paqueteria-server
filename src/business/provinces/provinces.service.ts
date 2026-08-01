import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { normalizeText } from '../../common/utils/normalize-text.js';

@Injectable()
export class ProvincesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.province.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    return this.prisma.province.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async findById(id: string) {
    const province = await this.prisma.province.findUnique({ where: { id } });
    if (!province) throw new NotFoundException('Province not found');
    return province;
  }

  async create(name: string) {
    return this.prisma.province.create({ data: { name: normalizeText(name) } });
  }

  async update(id: string, name: string) {
    await this.findById(id);
    return this.prisma.province.update({ where: { id }, data: { name: normalizeText(name) } });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.province.delete({ where: { id } });
  }
}
