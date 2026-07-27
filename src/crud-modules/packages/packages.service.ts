import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

function normalizePackageInclude(includeHistory = false) {
  return {
    hbls: true,
    recipient: true,
    province: true,
    municipe: true,
    status: true,
    location: true,
    guide: { include: { agency: true } },
    ...(includeHistory
      ? { statuses: { orderBy: { createdAt: 'desc' as const } } }
      : {}),
  };
}

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    provinceId?: string;
    municipeId?: string;
    isOrphan?: boolean;
    hbl?: string;
    recipientId?: string;
    guideId?: string;
    search?: string;
    alert?: boolean;
  }) {
    const where: any = {};
    if (filters.status) where.statusId = filters.status;
    if (filters.provinceId) where.provinceId = filters.provinceId;
    if (filters.municipeId) where.municipeId = filters.municipeId;
    if (filters.isOrphan !== undefined) where.isOrphan = filters.isOrphan;
    if (filters.alert !== undefined) where.alert = filters.alert;
    if (filters.hbl)
      where.hbls = {
        some: { hblCode: { contains: filters.hbl, mode: 'insensitive' } },
      };
    if (filters.recipientId) where.recipientId = filters.recipientId;
    if (filters.guideId) where.guideId = filters.guideId;
    if (filters.search) {
      where.OR = [
        { address: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        {
          hbls: {
            some: {
              hblCode: { contains: filters.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    return this.prisma.package.findMany({
      where,
      include: normalizePackageInclude(true),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: normalizePackageInclude(true),
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async findByHbl(hbl: string) {
    const packageHbl = await this.prisma.packageHbl.findUnique({
      where: { hblCode: hbl },
      include: {
        package: {
          include: normalizePackageInclude(true),
        },
      },
    });
    if (!packageHbl)
      throw new NotFoundException('Package not found for this HBL');
    return packageHbl as any;
  }

  async create(data: {
    guideId?: string;
    recipientId?: string;
    provinceId?: string;
    address?: string;
    weight?: number;
    content?: string;
    arrivalDate?: string;
    statusId: string;
    locationId?: string;
    isOrphan?: boolean;
    anotations?: string;
    alert?: boolean;
    alertDescription?: string;
    hbls?: string[];
  }) {
    const { hbls, ...packageData } = data;

    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.package.create({
        data: {
          ...packageData,
          arrivalDate: packageData.arrivalDate
            ? new Date(packageData.arrivalDate)
            : undefined,
        },
      });

      await tx.packageStatusHistory.create({
        data: {
          packageId: pkg.id,
          statusId: packageData.statusId,
        },
      });

      if (hbls && hbls.length > 0) {
        await tx.packageHbl.createMany({
          data: hbls.map((hbl) => ({ packageId: pkg.id, hblCode: hbl })),
        });
      }

      return tx.package.findUnique({
        where: { id: pkg.id },
        include: normalizePackageInclude(true),
      });
    });
  }

  async update(
    id: string,
    data: {
      guideId?: string;
      recipientId?: string;
      provinceId?: string;
      address?: string;
      weight?: number;
      content?: string;
      arrivalDate?: string;
      statusId?: string;
      locationId?: string;
      isOrphan?: boolean;
      anotations?: string;
      alert?: boolean;
      alertDescription?: string;
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
          arrivalDate: packageData.arrivalDate
            ? new Date(packageData.arrivalDate)
            : undefined,
        },
      });

      if (packageData.statusId) {
        await tx.packageStatusHistory.create({
          data: {
            packageId: id,
            statusId: packageData.statusId,
          },
        });
      }

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
        include: normalizePackageInclude(true),
      });
    });
  }

  async updateStatus(id: string, statusId: string, locationId?: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.package.update({
        where: { id },
        data: { statusId, locationId },
      });

      await tx.packageStatusHistory.create({
        data: {
          packageId: updated.id,
          statusId,
        },
      });

      return tx.package.findUniqueOrThrow({
        where: { id },
        include: normalizePackageInclude(true),
      });
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
