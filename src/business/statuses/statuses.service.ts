import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { normalizeText } from '../../common/utils/normalize-text.js';
import { CreateStatusDto } from './dto/create-status.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Injectable()
export class StatusesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.status.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    const status = await this.prisma.status.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!status) throw new NotFoundException('Status not found');
    return status;
  }

  async findById(id: string) {
    const status = await this.prisma.status.findUnique({ where: { id } });
    if (!status) throw new NotFoundException('Status not found');
    return status;
  }

  async create(dto: CreateStatusDto) {
    const name = normalizeText(dto.name);
    const existing = await this.prisma.status.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing)
      throw new ConflictException('Ya existe un estado con ese nombre');
    return this.prisma.status.create({ data: { name } });
  }

  async update(id: string, dto: UpdateStatusDto) {
    await this.findById(id);
    const name = normalizeText(dto.name);
    const existing = await this.prisma.status.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
    });
    if (existing)
      throw new ConflictException('Ya existe un estado con ese nombre');
    return this.prisma.status.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.status.delete({ where: { id } });
  }
}
