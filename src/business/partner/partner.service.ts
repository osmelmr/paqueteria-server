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
      return 'cagaste';
    }
    const stories = await this.prisma.packageStatusHistory.findMany({
      where: {
        packageId,
      },
    });
    return stories;
  }
}
