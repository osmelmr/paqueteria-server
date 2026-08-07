import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RecipientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    idCard?: string;
    phone?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, idCard, phone } = filters ?? {};
    const page = Math.max(1, Math.floor(filters?.page ?? 1) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Math.floor(filters?.limit ?? 10) || 10),
    );
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { idCard: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (idCard) where.idCard = idCard;
    if (phone) where.phone = { contains: phone };

    const [data, total] = await Promise.all([
      this.prisma.recipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.recipient.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const recipient = await this.prisma.recipient.findUnique({ where: { id } });
    if (!recipient) throw new NotFoundException('Recipient not found');
    return recipient;
  }

  async findByIdCard(idCard: string) {
    return this.prisma.recipient.findUnique({ where: { idCard } });
  }

  async create(data: { fullName: string; idCard: string; phone?: string }) {
    return this.prisma.recipient.create({ data });
  }

  async update(
    id: string,
    data: { fullName?: string; idCard?: string; phone?: string },
  ) {
    await this.findById(id);
    return this.prisma.recipient.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.recipient.delete({ where: { id } });
  }

  async upsertByIdCard(data: {
    fullName: string;
    idCard: string;
    phone?: string;
  }) {
    return this.prisma.recipient.upsert({
      where: { idCard: data.idCard },
      create: data,
      update: { fullName: data.fullName, phone: data.phone },
    });
  }
}
