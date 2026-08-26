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
    header?: boolean;
    hbl?: string;
    recipientId?: string;
    guideId?: string;
    search?: string;
    idCard?: string;
    alert?: boolean;
    statusDate?: string;
    locationId?: string;
    agencyId?: string;
    guideType?: 'AEREA' | 'MARITIMA';
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (filters.status) where.statusId = filters.status;
    if (filters.provinceIds?.length) {
      where.provinceId = { in: filters.provinceIds };
    } else if (filters.provinceId) {
      where.provinceId = filters.provinceId;
    }
    if (filters.header) {
      where.municipe = { header: true };
    } else if (filters.municipeId) {
      where.municipeId = filters.municipeId;
    }
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
    if (filters.idCard) {
      const matchingRecipients = await this.prisma.recipient.findMany({
        where: { idCard: { contains: filters.idCard, mode: 'insensitive' } },
        select: { id: true },
      });
      const recipientIds = matchingRecipients.map((r) => r.id);
      where.recipientId = { in: recipientIds };
    }
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    // ✅ Optimizado: solo obtener IDs de todos los paquetes filtrados
    const [items, total, allPackageIds] = await Promise.all([
      this.prisma.package.findMany({
        where,
        include: normalizePackageInclude(true),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.package.count({ where }),
      this.prisma.package.findMany({
        where,
        select: { id: true }, // 👈 Solo IDs, no datos completos
      }),
    ]);

    // ✅ Extraer IDs de forma limpia
    const ids = allPackageIds.map((pkg) => pkg.id);

    // ✅ Obtener HBLs de esos paquetes
    const hbls = await this.prisma.packageHbl.findMany({
      where: {
        packageId: { in: ids }, // 👈 packageId es más eficiente que package: { id: { in: ids } }
      },
      select: { hblCode: true },
    });

    const allHbls = hbls.map((hbl) => hbl.hblCode);

    return {
      items,
      hbls: allHbls,
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

  async checkHbls(
    hbls: string[],
  ): Promise<{ found: any[]; notFound: string[] }> {
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const raw of hbls) {
      const normalized = this.normalizeHbl(raw);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      unique.push(normalized);
    }

    const found: any[] = [];
    const foundPackageIds = new Set<string>();
    const matched = new Set<string>();

    const exact = await this.prisma.packageHbl.findMany({
      where: { hblCode: { in: unique } },
      include: { package: { include: normalizePackageInclude(true) } },
    });
    for (const match of exact) {
      matched.add(match.hblCode);
      if (!foundPackageIds.has(match.package.id)) {
        foundPackageIds.add(match.package.id);
        found.push(match.package);
      }
    }

    for (const hbl of unique) {
      if (matched.has(hbl)) continue;
      const fallback = await this.prisma.packageHbl.findFirst({
        where: { hblCode: { contains: hbl } },
        include: { package: { include: normalizePackageInclude(true) } },
      });
      if (fallback) {
        matched.add(hbl);
        if (!foundPackageIds.has(fallback.package.id)) {
          foundPackageIds.add(fallback.package.id);
          found.push(fallback.package);
        }
      }
    }

    const notFound = unique.filter((hbl) => !matched.has(hbl));

    return { found, notFound };
  }

  private normalizeHbl(hbl: string): string {
    return hbl.trim().replace(/^CM0?/i, '').replace(/AI$/i, '');
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
    statusDate?: string;
    statusId: string;
    locationId: string;
    anotations?: string;
    alert?: boolean;
    alertDescription?: string;
    hbls?: string[];
  }) {
    const { hbls, statusDate: _statusDate, ...packageData } = data;

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

  async bulkCreate(hbls: string[], statusId: string, locationId: string) {
    await this.validateReferences(
      this.prisma as any,
      statusId,
      locationId,
    );

    const uniqueHbls = [...new Set(hbls.map((h) => h.trim()).filter(Boolean))];
    if (uniqueHbls.length === 0) {
      throw new BadRequestException('Debe enviar al menos un HBL');
    }

    await this.assertHblsAvailable(
      this.prisma as any,
      uniqueHbls,
    );

    const created: Array<{ hbl: string; packageId: string }> = [];
    const failed: Array<{ hbl: string; error: string }> = [];

    for (const hbl of uniqueHbls) {
      try {
        const pkg = await this.prisma.$transaction(async (tx) => {
          const newPkg = await tx.package.create({
            data: { statusId, locationId },
          });
          await tx.packageStatusHistory.create({
            data: {
              packageId: newPkg.id,
              statusId,
              locationId,
            },
          });
          await tx.packageHbl.create({
            data: { packageId: newPkg.id, hblCode: hbl },
          });
          return newPkg;
        });
        created.push({ hbl, packageId: pkg.id });
      } catch (err) {
        failed.push({ hbl, error: (err as Error).message });
      }
    }

    return { created, failed, total: uniqueHbls.length };
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
      statusDate?: string;
      statusId?: string;
      locationId?: string;
      anotations?: string;
      alert?: boolean;
      alertDescription?: string;
      hbls?: string[];
    },
  ) {
    const { hbls, statusDate: _statusDate, ...packageData } = data;

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

      const nextStatusId = packageData.statusId ?? existing.statusId;
      const nextLocationId = packageData.locationId ?? existing.locationId;
      const statusChanged = nextStatusId !== existing.statusId || nextLocationId !== existing.locationId;

      if (statusChanged) {
        const historyLocationId =
          packageData.locationId ?? existing.locationId ?? null;
        if (!historyLocationId) {
          throw new BadRequestException(
            'Debe indicar una ubicación para registrar el nuevo estado',
          );
        }
        if (data.statusDate) {
          await this.assertStatusDateRange(
            tx,
            id,
            new Date(data.statusDate),
            0,
          );
        }
        await tx.packageStatusHistory.create({
          data: {
            packageId: id,
            statusId: nextStatusId,
            locationId: historyLocationId,
            ...(data.statusDate
              ? { createdAt: new Date(data.statusDate) }
              : {}),
          },
        });
      } else if (data.statusDate) {
        // Sin cambio de estado: actualizar la fecha del ultimo cambio registrado
        await this.assertStatusDateRange(tx, id, new Date(data.statusDate), 1);
        const latest = await tx.packageStatusHistory.findFirst({
          where: { packageId: id },
          orderBy: { createdAt: 'desc' },
        });
        if (latest) {
          await tx.packageStatusHistory.update({
            where: { id: latest.id },
            data: { createdAt: new Date(data.statusDate) },
          });
        }
      }

      return tx.package.findUnique({
        where: { id },
        include: normalizePackageInclude(true),
      });
    });
  }

  async updateStatus(
    id: string,
    statusId: string,
    locationId?: string,
    statusDate?: string,
  ) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');

    const effectiveLocationId = locationId ?? pkg.locationId;
    if (statusId === pkg.statusId && effectiveLocationId === pkg.locationId) {
      return pkg;
    }

    const historyLocationId = locationId ?? pkg.locationId ?? null;
    if (!historyLocationId) {
      throw new BadRequestException(
        'Debe indicar una ubicación para registrar el nuevo estado',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (statusDate) {
        await this.assertStatusDateRange(tx, id, new Date(statusDate), 0);
      }

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
          ...(statusDate ? { createdAt: new Date(statusDate) } : {}),
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

  private async assertStatusDateRange(
    tx: {
      packageStatusHistory: {
        findFirst: (args: {
          where: { packageId: string };
          orderBy: { createdAt: 'desc' };
          skip?: number;
        }) => Promise<{ id: string; createdAt: Date } | null>;
      };
    },
    packageId: string,
    date: Date,
    skip: number,
  ) {
    if (date.getTime() > Date.now()) {
      throw new BadRequestException(
        'La fecha del cambio de estado no puede ser futura',
      );
    }
    const reference = await tx.packageStatusHistory.findFirst({
      where: { packageId },
      orderBy: { createdAt: 'desc' },
      skip,
    });
    if (reference && date.getTime() < reference.createdAt.getTime()) {
      throw new BadRequestException(
        'La fecha del cambio de estado no puede ser anterior al último cambio registrado',
      );
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
