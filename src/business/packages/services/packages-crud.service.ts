import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

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
      ? {
          statuses: {
            orderBy: { createdAt: 'desc' as const },
            include: { status: true, location: true },
          },
        }
      : {}),
  };
}

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    provinceId?: string;
    provinceIds?: string[];
    municipeId?: string;
    hbl?: string;
    recipientId?: string;
    guideId?: string;
    search?: string;
    alert?: boolean;
    statusDate?: string;
    locationId?: string;
    agencyId?: string;
    guideType?: 'AEREA' | 'MARITIMA';
    page?: number;
    limit?: number;
  }) {
    console.log(filters);
    const where: any = {};
    if (filters.status) where.statusId = filters.status;
    if (filters.provinceIds?.length) {
      where.provinceId = { in: filters.provinceIds };
    } else if (filters.provinceId) {
      where.provinceId = filters.provinceId;
    }
    if (filters.municipeId) where.municipeId = filters.municipeId;
    if (filters.alert !== undefined) where.alert = filters.alert;
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.agencyId || filters.guideType) {
      where.guide = {
        ...(filters.agencyId && { agencyId: filters.agencyId }),
        ...(filters.guideType && { type: filters.guideType }),
      };
    }
    if (filters.statusDate) {
      const date = new Date(filters.statusDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.statuses = {
        some: {
          createdAt: { gte: date, lt: nextDay },
        },
      };
    }
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
    // 2. Calcular el offset (skip)
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // 3. Hacer dos consultas: una para los datos y otra para el total
    const [items, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        include: normalizePackageInclude(true),
        orderBy: { createdAt: 'desc' },
        skip, // Cuántos registros saltar
        take: limit, // Cuántos registros tomar
      }),
      this.prisma.package.count({ where }), // Total de registros que coinciden con los filtros
    ]);
    console.log({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
    // 4. Devolver el resultado paginado
    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
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
    municipeId?: string;
    address?: string;
    weight?: number;
    content?: string;
    arrivalDate?: string;
    statusId: string;
    locationId: string;
    anotations?: string;
    alert?: boolean;
    alertDescription?: string;
    hbls?: string[];
  }) {
    const { hbls, ...packageData } = data;

    return this.prisma.$transaction(async (tx) => {
      await this.validateReferences(
        tx,
        packageData.statusId,
        packageData.locationId,
      );
      if (hbls && hbls.length > 0) {
        await this.assertHblsAvailable(tx, hbls);
      }

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
          locationId: packageData.locationId,
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
      municipeId?: string;
      address?: string;
      weight?: number;
      content?: string;
      arrivalDate?: string;
      statusId?: string;
      locationId?: string;
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

      if (packageData.statusId || packageData.locationId) {
        await this.validateReferences(
          tx,
          packageData.statusId ?? existing.statusId,
          packageData.locationId ?? existing.locationId,
        );
      }

      if (hbls) {
        await tx.packageHbl.deleteMany({ where: { packageId: id } });
        if (hbls.length > 0) {
          await this.assertHblsAvailable(tx, hbls, id);
          await tx.packageHbl.createMany({
            data: hbls.map((hbl) => ({ packageId: id, hblCode: hbl })),
          });
        }
      }

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
        const historyLocationId =
          packageData.locationId ?? existing.locationId ?? null;
        if (!historyLocationId) {
          throw new BadRequestException(
            'Debe indicar una ubicación para registrar el nuevo estado',
          );
        }
        await tx.packageStatusHistory.create({
          data: {
            packageId: id,
            statusId: packageData.statusId,
            locationId: historyLocationId,
          },
        });
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

    const historyLocationId = locationId ?? pkg.locationId ?? null;
    if (!historyLocationId) {
      throw new BadRequestException(
        'Debe indicar una ubicación para registrar el nuevo estado',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.package.update({
        where: { id },
        data: {
          statusId,
          ...(locationId !== undefined && { locationId }),
        },
      });

      await tx.packageStatusHistory.create({
        data: {
          packageId: updated.id,
          statusId,
          locationId: historyLocationId,
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

  private async validateReferences(
    tx: {
      status: {
        findUnique: (args: { where: { id: string } }) => Promise<unknown>;
      };
      location: {
        findUnique: (args: { where: { id: string } }) => Promise<unknown>;
      };
    },
    statusId: string,
    locationId?: string | null,
  ) {
    if (statusId) {
      const status = await tx.status.findUnique({ where: { id: statusId } });
      if (!status)
        throw new BadRequestException(`Status inválido: ${statusId}`);
    }
    if (locationId) {
      const location = await tx.location.findUnique({
        where: { id: locationId },
      });
      if (!location)
        throw new BadRequestException(`Ubicación inválida: ${locationId}`);
    }
  }

  private async assertHblsAvailable(
    tx: {
      packageHbl: {
        findMany: (args: {
          where: { hblCode: { in: string[] }; packageId?: { not: string } };
          select: { hblCode: true };
        }) => Promise<Array<{ hblCode: string }>>;
      };
    },
    hbls: string[],
    exceptPackageId?: string,
  ) {
    const existing = await tx.packageHbl.findMany({
      where: {
        hblCode: { in: hbls },
        ...(exceptPackageId ? { packageId: { not: exceptPackageId } } : {}),
      },
      select: { hblCode: true },
    });
    if (existing.length > 0) {
      throw new BadRequestException(
        `Los siguientes HBL ya están en uso: ${existing.map((h) => h.hblCode).join(', ')}`,
      );
    }
  }
}
