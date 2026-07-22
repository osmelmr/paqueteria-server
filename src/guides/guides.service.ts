import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PackageRowDto } from './dto/package-row.dto.js';
import { ConfirmGuideDto } from './dto/confirm-guide.dto.js';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.guide.findMany({
      include: { _count: { select: { packages: true } } },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const guide = await this.prisma.guide.findUnique({
      where: { id },
      include: {
        packages: {
          include: {
            hbls: true,
            recipient: true,
            province: true,
            status: true,
            location: true,
          },
        },
      },
    });
    if (!guide) throw new NotFoundException('Guide not found');
    return guide;
  }

  async createManual(data: { externalRef: string; agency: string }) {
    return this.prisma.guide.create({ data });
  }

  async delete(id: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException('Guide not found');

    return this.prisma.$transaction(async (tx) => {
      const packages = await tx.package.findMany({ where: { guideId: id }, select: { id: true } });
      const packageIds = packages.map((p) => p.id);

      if (packageIds.length > 0) {
        await tx.packageHbl.deleteMany({ where: { packageId: { in: packageIds } } });
        await tx.package.deleteMany({ where: { guideId: id } });
      }

      await tx.guide.delete({ where: { id } });
    });
  }

  async uploadPreview(rows: string[]): Promise<PackageRowDto[]> {
    return [];
  }

  async confirm(dto: ConfirmGuideDto): Promise<any> {
    throw new Error('No implementado');
  }
}
