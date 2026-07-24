import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
}
