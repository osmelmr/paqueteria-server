import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    provinceId?: string;
    isOrphan?: boolean;
    hbl?: string;
    recipientId?: string;
    guideId?: string;
    search?: string;
  }) {
    const where: any = {};
    if (filters.status) where.statusId = filters.status;
    if (filters.provinceId) where.provinceId = filters.provinceId;
    if (filters.isOrphan !== undefined) where.isOrphan = filters.isOrphan;
    if (filters.hbl) where.hbls = { some: { hblCode: { contains: filters.hbl, mode: 'insensitive' } } };
    if (filters.recipientId) where.recipientId = filters.recipientId;
    if (filters.guideId) where.guideId = filters.guideId;
    if (filters.search) {
      where.OR = [
        { addressDetail: { contains: filters.search, mode: 'insensitive' } },
        { contentDescription: { contains: filters.search, mode: 'insensitive' } },
        { hbls: { some: { hblCode: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    return this.prisma.package.findMany({
      where,
      include: {
        hbls: true,
        recipient: true,
        province: true,
        status: true,
        location: true,
        guide: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        hbls: true,
        recipient: true,
        province: true,
        status: true,
        location: true,
        guide: true,
      },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async findByHbl(hbl: string) {
    const packageHbl = await this.prisma.packageHbl.findUnique({
      where: { hblCode: hbl },
      include: {
        package: {
          include: {
            hbls: true,
            recipient: true,
            province: true,
            status: true,
            location: true,
            guide: true,
          },
        },
      },
    });
    if (!packageHbl) throw new NotFoundException('Package not found for this HBL');
    return packageHbl.package;
  }

  async create(data: {
    guideId?: string;
    recipientId?: string;
    provinceId?: string;
    addressDetail?: string;
    weight?: number;
    contentDescription?: string;
    departureDate?: string;
    statusId: string;
    locationId?: string;
    isOrphan?: boolean;
    hbls?: string[];
  }) {
    const { hbls, ...packageData } = data;

    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.package.create({
        data: {
          ...packageData,
          departureDate: packageData.departureDate ? new Date(packageData.departureDate) : undefined,
        },
      });

      if (hbls && hbls.length > 0) {
        await tx.packageHbl.createMany({
          data: hbls.map((hbl) => ({ packageId: pkg.id, hblCode: hbl })),
        });
      }

      return tx.package.findUnique({
        where: { id: pkg.id },
        include: {
          hbls: true,
          recipient: true,
          province: true,
          status: true,
          location: true,
          guide: true,
        },
      });
    });
  }

  async update(
    id: string,
    data: {
      guideId?: string;
      recipientId?: string;
      provinceId?: string;
      addressDetail?: string;
      weight?: number;
      contentDescription?: string;
      departureDate?: string;
      statusId?: string;
      locationId?: string;
      isOrphan?: boolean;
      hbls?: string[];
    },
  ) {
    const { hbls, ...packageData } = data;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.package.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Package not found');

      await tx.package.update({
        where: { id },
        data: {
          ...packageData,
          departureDate: packageData.departureDate ? new Date(packageData.departureDate) : undefined,
        },
      });

      if (hbls) {
        await tx.packageHbl.deleteMany({ where: { packageId: id } });
        if (hbls.length > 0) {
          await tx.packageHbl.createMany({
            data: hbls.map((hbl) => ({ packageId: id, hblCode: hbl })),
          });
        }
      }

      return tx.package.findUnique({
        where: { id },
        include: {
          hbls: true,
          recipient: true,
          province: true,
          status: true,
          location: true,
          guide: true,
        },
      });
    });
  }

  async updateStatus(id: string, statusId: string, locationId?: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    return this.prisma.package.update({
      where: { id },
      data: { statusId, locationId },
      include: {
        hbls: true,
        recipient: true,
        province: true,
        status: true,
        location: true,
        guide: true,
      },
    });
  }

  async delete(id: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.packageHbl.deleteMany({ where: { packageId: id } });
      await tx.package.delete({ where: { id } });
    });
  }
}
