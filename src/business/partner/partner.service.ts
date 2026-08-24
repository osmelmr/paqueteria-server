import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(agencyId: string, search?: string, guideId?: string) {
    const where: any = {
      guide: {
        agencyId,
        ...(guideId && { id: guideId }),
      },
    };

    const q = search?.trim();
    if (q) {
      where.OR = [
        { hbls: { some: { hblCode: { contains: q, mode: 'insensitive' } } } },
        { recipient: { idCard: { contains: q, mode: 'insensitive' } } },
        { recipient: { phone: { contains: q, mode: 'insensitive' } } },
        { recipient: { fullName: { contains: q, mode: 'insensitive' } } },
        { guide: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  async getAll(
    agencyId: string,
    search?: string,
    page = 1,
    limit = 50,
    guideId?: string,
  ) {
    const where = this.buildWhere(agencyId, search, guideId);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        include: {
          hbls: true,
          recipient: true,
          province: true,
          municipe: true,
          status: true,
          location: true,
          guide: { include: { agency: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.package.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getStats(agencyId: string, search?: string, guideId?: string) {
    const where = this.buildWhere(agencyId, search, guideId);

    const [total, byStatusRaw] = await Promise.all([
      this.prisma.package.count({ where }),
      this.prisma.package.groupBy({
        by: ['statusId'],
        where,
        _count: true,
      }),
    ]);

    const statusIds = byStatusRaw.map((s) => s.statusId);
    const statuses = await this.prisma.status.findMany({
      where: { id: { in: statusIds } },
      select: { id: true, name: true },
    });
    const statusNames = new Map(statuses.map((s) => [s.id, s.name]));

    const byStatus = byStatusRaw
      .map((s) => ({
        statusId: s.statusId,
        name: statusNames.get(s.statusId) ?? 'Desconocido',
        count: s._count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      byStatus,
    };
  }

  async getGuides(agencyId: string) {
    return await this.prisma.guide.findMany({
      where: { agencyId, active: true },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getStory(packageId: string, agencyId: string) {
    const agency = await this.prisma.package.findUnique({
      where: {
        id: packageId,
      },
      select: {
        guide: {
          select: { agencyId: true },
        },
      },
    });
    if (agencyId !== agency?.guide?.agencyId) {
      return [];
    }
    const stories = await this.prisma.packageStatusHistory.findMany({
      where: {
        packageId,
      },
      orderBy: { createdAt: 'desc' },
      include: { status: true, location: true },
    });
    return stories;
  }
}
