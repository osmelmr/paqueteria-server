import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GuideType } from '../../../generated/prisma/enums.js';

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

  async create(name: string, type: GuideType) {
    return this.prisma.agency.create({ data: { name, type } });
  }

  async update(id: string, name?: string, type?: GuideType) {
    await this.findById(id);
    return this.prisma.agency.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.agency.delete({ where: { id } });
  }
}
