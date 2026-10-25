import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { normalizeHbl } from '../../../common/utils/normalize-hbls.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import { BulkUpsertPackageDto } from '../dto/bulk-upsert.dto.js';
import { BusinessService } from './business.service.js';

export interface BulkUpsertResult {
  created: Array<{ hbls: string[]; packageId: string }>;
  updated: Array<{ hbls: string[]; packageId: string }>;
  failed: Array<{ hbls: string[]; error: string }>;
  total: number;
}

/** Data parcial del paquete: el status es obligatorio solo al crear */
type PackageDataInput = Omit<Prisma.PackageUncheckedCreateInput, 'statusId'> & {
  statusId?: string;
};

type BulkDefaults = { statusId: string; locationId: string };

/**
 * Crea en lote los paquetes que NO existen y ACTUALIZA los que SI existen
 * (identificados por su HBL). Solo se sobrescriben los campos que vienen
 * con valor; los vacios conservan lo que ya tenia el paquete.
 */
@Injectable()
export class PackagesUpsertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly business: BusinessService,
  ) {}

  async bulkUpsert(
    packages: BulkUpsertPackageDto[],
    defaults: BulkDefaults,
    userId: string,
  ): Promise<BulkUpsertResult> {
    const result: BulkUpsertResult = {
      created: [],
      updated: [],
      failed: [],
      total: 0,
    };

    if (!Array.isArray(packages) || packages.length === 0) {
      throw new BadRequestException('Debe enviar al menos un paquete');
    }

    // Las referencias por defecto se validan una sola vez (falla todo el lote)
    await this.validateReferences(defaults.statusId, defaults.locationId);

    for (const item of packages) {
      const hbls = this.normalizeHbls(item.hbls);
      result.total += 1;

      if (hbls.length === 0) {
        result.failed.push({
          hbls: item.hbls ?? [],
          error: 'El paquete no tiene HBL y no puede guardarse',
        });
        continue;
      }

      try {
        const existing = await this.prisma.packageHbl.findMany({
          where: { hblCode: { in: hbls } },
          select: { hblCode: true, packageId: true },
        });

        const packageIds = [...new Set(existing.map((e) => e.packageId))];

        if (packageIds.length > 1) {
          throw new BadRequestException(
            `Los HBL ${hbls.join(', ')} pertenecen a paquetes distintos en el sistema`,
          );
        }

        if (packageIds.length === 1) {
          const packageId = await this.updatePackage(
            packageIds[0],
            item,
            hbls,
            existing.map((e) => e.hblCode),
            userId,
          );
          result.updated.push({ hbls, packageId });
        } else {
          const packageId = await this.createPackage(
            hbls,
            item,
            defaults,
            userId,
          );
          result.created.push({ hbls, packageId });
        }
      } catch (error) {
        result.failed.push({ hbls, error: (error as Error).message });
      }
    }

    return result;
  }

  private normalizeHbls(hbls?: string[]): string[] {
    if (!Array.isArray(hbls)) return [];
    const normalized = hbls
      .map((hbl) => normalizeHbl(String(hbl ?? '')))
      .filter((hbl) => hbl.length > 0);
    return [...new Set(normalized)];
  }

  private hasValue(value: unknown): boolean {
    return !(
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private async validateReferences(statusId?: string, locationId?: string) {
    if (statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: statusId },
      });
      if (!status)
        throw new BadRequestException(`Status inválido: ${statusId}`);
    }
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location)
        throw new BadRequestException(`Ubicación inválida: ${locationId}`);
    }
  }

  /**
   * Construye el data del paquete SOLO con los campos que vienen con valor.
   * Resuelve/crea provincia, municipio y destinatario igual que el resto
   * de la aplicacion.
   */
  private async buildPackageData(
    item: BulkUpsertPackageDto,
  ): Promise<PackageDataInput> {
    const data: PackageDataInput = {};

    if (this.hasValue(item.guideId)) {
      const guide = await this.prisma.guide.findUnique({
        where: { id: item.guideId },
      });
      if (!guide)
        throw new BadRequestException(`Guía inválida: ${item.guideId}`);
      data.guideId = guide.id;
    }

    if (this.hasValue(item.provinceId)) {
      const province = await this.prisma.province.findUnique({
        where: { id: item.provinceId },
      });
      if (!province)
        throw new BadRequestException(`Provincia inválida: ${item.provinceId}`);
      data.provinceId = province.id;
    } else if (this.hasValue(item.province)) {
      data.provinceId = await this.business.resolveOrCreateNamedEntity(
        this.prisma.province,
        item.province!,
      );
    }

    if (this.hasValue(item.municipeId)) {
      const municipe = await this.prisma.municipe.findUnique({
        where: { id: item.municipeId },
      });
      if (!municipe)
        throw new BadRequestException(`Municipio inválido: ${item.municipeId}`);
      data.municipeId = municipe.id;
    } else if (this.hasValue(item.municipe)) {
      data.municipeId = await this.business.resolveOrCreateNamedEntity(
        this.prisma.municipe,
        item.municipe!,
      );
    }

    if (this.hasValue(item.recipientId)) {
      const recipient = await this.prisma.recipient.findUnique({
        where: { id: item.recipientId },
      });
      if (!recipient)
        throw new BadRequestException(
          `Destinatario inválido: ${item.recipientId}`,
        );
      data.recipientId = recipient.id;
    } else if (this.hasValue(item.idCard)) {
      const digits = item.idCard!.replace(/\D/g, '');
      if (digits.length >= 8) {
        const existing = await this.prisma.recipient.findFirst({
          where: { idCard: { contains: digits } },
        });
        if (existing) {
          data.recipientId = existing.id;
        } else {
          const created = await this.prisma.recipient.create({
            data: {
              fullName: item.fullName,
              idCard: digits,
              phone: item.phone,
            },
          });
          data.recipientId = created.id;
        }
      }
    }

    if (this.hasValue(item.address)) data.address = item.address;
    if (this.hasValue(item.content)) data.content = item.content;
    if (this.hasValue(item.anotations)) data.anotations = item.anotations;
    if (
      item.weight !== null &&
      item.weight !== undefined &&
      Number.isFinite(Number(item.weight)) &&
      Number(item.weight) > 0
    ) {
      data.weight = Number(item.weight);
    }
    if (this.hasValue(item.arrivalDate)) {
      const date = new Date(item.arrivalDate!);
      if (!Number.isNaN(date.getTime())) data.arrivalDate = date;
    }

    return data;
  }

  private async createPackage(
    hbls: string[],
    item: BulkUpsertPackageDto,
    defaults: BulkDefaults,
    userId: string,
  ): Promise<string> {
    const statusId = this.hasValue(item.statusId)
      ? item.statusId!
      : defaults.statusId;
    const locationId = this.hasValue(item.locationId)
      ? item.locationId!
      : defaults.locationId;

    await this.validateReferences(statusId, locationId);
    const partial = await this.buildPackageData(item);
    const packageData: Prisma.PackageUncheckedCreateInput = {
      ...partial,
      statusId,
      locationId,
    };

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.package.create({ data: packageData });

      await tx.packageStatusHistory.create({
        data: {
          packageId: created.id,
          statusId,
          locationId,
          userId,
        },
      });

      if (hbls.length > 0) {
        await tx.packageHbl.createMany({
          data: hbls.map((hblCode) => ({
            packageId: created.id,
            hblCode,
          })),
        });
      }

      return created.id;
    });
  }

  private async updatePackage(
    packageId: string,
    item: BulkUpsertPackageDto,
    hbls: string[],
    alreadyOwnedHbls: string[],
    userId: string,
  ): Promise<string> {
    const existing = await this.prisma.package.findUnique({
      where: { id: packageId },
    });
    if (!existing) {
      throw new BadRequestException(
        'El paquete asociado a estos HBL ya no existe',
      );
    }

    const packageData = await this.buildPackageData(item);

    // El estado/ubicacion por defecto del lote NO se aplica al actualizar,
    // solo si vienen indicados explicitamente en el item.
    if (this.hasValue(item.statusId)) {
      await this.validateReferences(item.statusId);
      packageData.statusId = item.statusId!;
    }
    if (this.hasValue(item.locationId)) {
      await this.validateReferences(undefined, item.locationId);
      packageData.locationId = item.locationId!;
    }

    const finalStatusId = packageData.statusId ?? existing.statusId;
    const finalLocationId = packageData.locationId ?? existing.locationId;
    const statusChanged =
      (packageData.statusId !== undefined &&
        packageData.statusId !== existing.statusId) ||
      (packageData.locationId !== undefined &&
        packageData.locationId !== existing.locationId);

    const newHbls = hbls.filter((hbl) => !alreadyOwnedHbls.includes(hbl));

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(packageData).length > 0) {
        await tx.package.update({
          where: { id: packageId },
          data: packageData,
        });
      }

      if (newHbls.length > 0) {
        const conflicts = await tx.packageHbl.findMany({
          where: { hblCode: { in: newHbls } },
          select: { hblCode: true },
        });
        if (conflicts.length > 0) {
          throw new BadRequestException(
            `Los siguientes HBL ya están en uso: ${conflicts
              .map((c) => c.hblCode)
              .join(', ')}`,
          );
        }
        await tx.packageHbl.createMany({
          data: newHbls.map((hblCode) => ({ packageId, hblCode })),
        });
      }

      if (statusChanged) {
        if (!finalLocationId) {
          throw new BadRequestException(
            'Debe indicar una ubicación para registrar el nuevo estado',
          );
        }
        await tx.packageStatusHistory.create({
          data: {
            packageId,
            statusId: finalStatusId,
            locationId: finalLocationId,
            userId,
          },
        });
      }

      return packageId;
    });
  }
}
