import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { normalizeText } from '../../common/utils/normalize-text.js';

@Injectable()
export class MunicipesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.municipe.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    return this.prisma.municipe.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async findById(id: string) {
    const municipe = await this.prisma.municipe.findUnique({ where: { id } });
    if (!municipe) throw new NotFoundException('Municipe not found');
    return municipe;
  }

  async create(name: string, header?: boolean) {
    return this.prisma.municipe.create({
      data: {
        name: normalizeText(name),
        ...(header !== undefined && { header }),
      },
    });
  }

  async update(id: string, name: string, header?: boolean) {
    await this.findById(id);
    return this.prisma.municipe.update({
      where: { id },
      data: {
        name: normalizeText(name),
        ...(header !== undefined && { header }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.municipe.delete({ where: { id } });
  }
}
