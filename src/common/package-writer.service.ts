import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeHbl } from './utils/normalize-hbls.js';

interface CreatePackageData {
  guideId?: string;
  recipientId?: string;
  provinceId?: string;
  municipeId?: string;
  address?: string;
  weight?: number;
  content?: string;
  anotations?: string;
  alert?: boolean;
  alertDescription?: string;
  arrivalDate?: string | Date;
  statusId: string;
  locationId: string;
  hbls?: string[];
}

interface UpdatePackageData {
  guideId?: string;
  recipientId?: string;
  provinceId?: string;
  municipeId?: string;
  address?: string;
  weight?: number;
  content?: string;
  anotations?: string;
  alert?: boolean;
  alertDescription?: string;
  arrivalDate?: string | Date;
  statusId?: string;
  locationId?: string;
  statusDate?: string;
  hbls?: string[];
}

@Injectable()
export class PackageWriterService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeHbls(hbls: string[]): string[] {
    return [
      ...new Set(hbls.map((h) => normalizeHbl(h)).filter((h) => h.length > 0)),
    ];
  }

  private async assertHblsAvailable(hbls: string[], exceptPackageId?: string) {
    const existing = await this.prisma.packageHbl.findMany({
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

  async create(data: CreatePackageData) {
    const { hbls, ...packageData } = data;
    const normalizedHbls = this.normalizeHbls(hbls ?? []);

    return this.prisma.$transaction(async (tx) => {
      await this.assertHblsAvailable(normalizedHbls);

      if (packageData.statusId) {
        const status = await tx.status.findUnique({
          where: { id: packageData.statusId },
        });
        if (!status)
          throw new BadRequestException(
            `Status inválido: ${packageData.statusId}`,
          );
      }
      if (packageData.locationId) {
        const location = await tx.location.findUnique({
          where: { id: packageData.locationId },
        });
        if (!location)
          throw new BadRequestException(
            `Ubicación inválida: ${packageData.locationId}`,
          );
      }

      const pkg = await tx.package.create({
        data: {
          ...packageData,
          arrivalDate: packageData.arrivalDate
            ? new Date(packageData.arrivalDate)
            : undefined,
          weight: packageData.weight ?? undefined,
        },
      });

      await tx.packageStatusHistory.create({
        data: {
          packageId: pkg.id,
          statusId: packageData.statusId,
          locationId: packageData.locationId,
        },
      });

      if (normalizedHbls.length > 0) {
        await tx.packageHbl.createMany({
          data: normalizedHbls.map((hbl) => ({
            packageId: pkg.id,
            hblCode: hbl,
          })),
        });
      }

      return tx.package.findUnique({
        where: { id: pkg.id },
        include: {
          guide: { include: { agency: true } },
          recipient: true,
          province: true,
          municipe: true,
          status: true,
          location: true,
          hbls: true,
          statuses: {
            orderBy: { createdAt: 'desc' },
            include: { status: true, location: true },
          },
        },
      });
    });
  }

  async update(id: string, data: UpdatePackageData) {
    const { hbls, statusDate, ...updateData } = data;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.package.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Package not found');

      if (updateData.statusId) {
        const status = await tx.status.findUnique({
          where: { id: updateData.statusId },
        });
        if (!status)
          throw new BadRequestException(
            `Status inválido: ${updateData.statusId}`,
          );
      }
      if (updateData.locationId) {
        const location = await tx.location.findUnique({
          where: { id: updateData.locationId },
        });
        if (!location)
          throw new BadRequestException(
            `Ubicación inválida: ${updateData.locationId}`,
          );
      }

      if (hbls) {
        const normalizedHbls = this.normalizeHbls(hbls);
        await tx.packageHbl.deleteMany({ where: { packageId: id } });
        if (normalizedHbls.length > 0) {
          await this.assertHblsAvailable(normalizedHbls, id);
          await tx.packageHbl.createMany({
            data: normalizedHbls.map((hbl) => ({
              packageId: id,
              hblCode: hbl,
            })),
          });
        }
      }

      const { statusId, locationId, ...rest } = updateData;

      await tx.package.update({
        where: { id },
        data: {
          ...rest,
          statusId,
          locationId,
          arrivalDate: updateData.arrivalDate
            ? new Date(updateData.arrivalDate)
            : undefined,
          weight: updateData.weight ?? undefined,
        },
      });

      const nextStatusId = statusId ?? existing.statusId;
      const nextLocationId = locationId ?? existing.locationId;
      const statusChanged =
        nextStatusId !== existing.statusId ||
        nextLocationId !== existing.locationId;

      if (statusChanged) {
        const historyLocationId = nextLocationId ?? existing.locationId;
        if (!historyLocationId) {
          throw new BadRequestException(
            'Debe indicar una ubicación para registrar el nuevo estado',
          );
        }
        await tx.packageStatusHistory.create({
          data: {
            packageId: id,
            statusId: nextStatusId,
            locationId: historyLocationId,
            createdAt: statusDate ? new Date(statusDate) : new Date(),
          },
        });
      }

      return tx.package.findUnique({
        where: { id },
        include: {
          guide: { include: { agency: true } },
          recipient: true,
          province: true,
          municipe: true,
          status: true,
          location: true,
          hbls: true,
          statuses: {
            orderBy: { createdAt: 'desc' },
            include: { status: true, location: true },
          },
        },
      });
    });
  }
}
