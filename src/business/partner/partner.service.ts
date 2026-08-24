import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(agencyId: string) {
    return await this.prisma.package.findMany({
      where: {
        guide: {
          agencyId,
        },
      },
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
