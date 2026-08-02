import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateStatusDto } from './dto/create-status.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Injectable()
export class StatusesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.status.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    return this.prisma.status.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async findById(id: string) {
    const status = await this.prisma.status.findUnique({ where: { id } });
    if (!status) throw new NotFoundException('Status not found');
    return status;
  }

  async create(dto: CreateStatusDto) {
    return this.prisma.status.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: UpdateStatusDto) {
    await this.findById(id);
    return this.prisma.status.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.status.delete({ where: { id } });
  }
}
