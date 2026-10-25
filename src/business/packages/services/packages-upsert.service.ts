import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { normalizeHbl } from '../../../common/utils/normalize-hbls.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import { GuideType } from '../../../../generated/prisma/enums.js';
import { BulkUpsertPackageDto } from '../dto/bulk-upsert.dto.js';
import { BusinessService } from './business.service.js';

export interface BulkUpsertResult {
  created: Array<{ hblCodes: string[]; packageId: string }>;
  updated: Array<{ hblCodes: string[]; packageId: string }>;
  failed: Array<{ hblCodes: string[]; error: string }>;
  total: number;
}

/** Metadatos del lote (solo aplican al crear paquetes nuevos) */
export interface BulkUpsertMeta {
  statusId: string;
  locationId?: string;
  agencyId?: string;
  guideId?: string;
  guide?: string;
  guideType?: GuideType;
}

/** Data parcial del paquete: el status es obligatorio solo al crear */
type PackageDataInput = Omit<Prisma.PackageUncheckedCreateInput, 'statusId'> & {
  statusId?: string;
};

/**
 * Importa un lote creando los paquetes que NO existen y ACTUALIZANDO los
 * que SI existen (identificados por su HBL). Solo se sobrescriben los
 * campos de la fila que vienen con valor; los vacios conservan lo que ya
 * tenia el paquete.
 */
@Injectable()
export class PackagesUpsertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly business: BusinessService,
  ) {}

  async bulkUpsert(
    packages: BulkUpsertPackageDto[],
    meta: BulkUpsertMeta,
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

    // Metadatos del lote: se validan/resuelven una sola vez para todo el lote
    await this.validateReferences(meta.statusId, meta.locationId);
    if (this.hasValue(meta.agencyId)) {
      await this.validateAgency(meta.agencyId!);
    }
    const guideId = await this.resolveGuide(meta);

    for (const item of packages) {
      const hblCodes = this.normalizeHbls(item.hblCodes);
      result.total += 1;

      if (hblCodes.length === 0) {
        result.failed.push({
          hblCodes: item.hblCodes ?? [],
          error: 'El paquete no tiene HBL y no puede guardarse',
        });
        continue;
      }

      try {
        const existing = await this.prisma.packageHbl.findMany({
          where: { hblCode: { in: hblCodes } },
          select: { hblCode: true, packageId: true },
        });

        const packageIds = [...new Set(existing.map((e) => e.packageId))];

        if (packageIds.length > 1) {
          throw new BadRequestException(
            `Los HBL ${hblCodes.join(', ')} pertenecen a paquetes distintos en el sistema`,
          );
        }

        if (packageIds.length === 1) {
          const packageId = await this.updatePackage(
            packageIds[0],
            item,
            hblCodes,
            existing.map((e) => e.hblCode),
            userId,
          );
          result.updated.push({ hblCodes, packageId });
        } else {
          const packageId = await this.createPackage(
            hblCodes,
            item,
            { ...meta, guideId },
            userId,
          );
          result.created.push({ hblCodes, packageId });
        }
      } catch (error) {
        result.failed.push({
          hblCodes,
          error: (error as Error).message,
        });
      }
    }

    return result;
  }

  private normalizeHbls(hblCodes?: string[]): string[] {
    if (!Array.isArray(hblCodes)) return [];
    const normalized = hblCodes
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

  private async validateAgency(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });
    if (!agency) throw new BadRequestException(`Agencia inválida: ${agencyId}`);
  }

  /**
   * Resuelve la guia del lote igual que la importacion normal de Excel:
   * si trae id la valida, si trae nombre busca y si no existe la crea.
   */
  private async resolveGuide(
    meta: BulkUpsertMeta,
  ): Promise<string | undefined> {
    if (this.hasValue(meta.guideId)) {
      const guide = await this.prisma.guide.findUnique({
        where: { id: meta.guideId },
      });
      if (!guide)
        throw new BadRequestException(`Guía inválida: ${meta.guideId}`);
      return guide.id;
    }

    const name = this.hasValue(meta.guide) ? meta.guide!.trim() : '';
    if (!name) return undefined;

    const existing = await this.prisma.guide.findUnique({
      where: { name },
    });
    if (existing) return existing.id;

    if (!this.hasValue(meta.agencyId)) {
      throw new BadRequestException(
        'Debe indicar una agencia para crear una guía nueva',
      );
    }
    if (!meta.guideType) {
      throw new BadRequestException(
        'Debe indicar el tipo de guía para crear una guía nueva',
      );
    }

    try {
      const created = await this.prisma.guide.create({
        data: {
          name,
          agencyId: meta.agencyId!,
          type: meta.guideType,
        },
      });
      return created.id;
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        const duplicate = await this.prisma.guide.findUnique({
          where: { name },
        });
        if (duplicate) return duplicate.id;
      }
      throw err;
    }
  }

  /**
   * Construye el data del paquete SOLO con los campos de la fila que vienen
   * con valor. Resuelve/crea provincia, municipio y destinatario igual que
   * el resto de la aplicacion.
   */
  private async buildPackageData(
    item: BulkUpsertPackageDto,
  ): Promise<PackageDataInput> {
    const data: PackageDataInput = {};

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
    hblCodes: string[],
    item: BulkUpsertPackageDto,
    meta: BulkUpsertMeta & { guideId?: string },
    userId: string,
  ): Promise<string> {
    const statusId = this.hasValue(item.statusId)
      ? item.statusId!
      : meta.statusId;
    const locationId = this.hasValue(item.locationId)
      ? item.locationId!
      : meta.locationId;

    if (!locationId) {
      throw new BadRequestException(
        'Debe indicar una ubicación para crear el paquete',
      );
    }

    await this.validateReferences(statusId, locationId);
    const partial = await this.buildPackageData(item);
    const packageData: Prisma.PackageUncheckedCreateInput = {
      ...partial,
      statusId,
      locationId,
      ...(meta.guideId ? { guideId: meta.guideId } : {}),
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

      if (hblCodes.length > 0) {
        await tx.packageHbl.createMany({
          data: hblCodes.map((hblCode) => ({
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
    hblCodes: string[],
    alreadyOwnedHblCodes: string[],
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

    // Los metadatos del lote (estado/ubicacion/guia) NO se aplican al
    // actualizar, solo si vienen indicados explicitamente en la fila.
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

    const newHblCodes = hblCodes.filter(
      (hbl) => !alreadyOwnedHblCodes.includes(hbl),
    );

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(packageData).length > 0) {
        await tx.package.update({
          where: { id: packageId },
          data: packageData,
        });
      }

      if (newHblCodes.length > 0) {
        const conflicts = await tx.packageHbl.findMany({
          where: { hblCode: { in: newHblCodes } },
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
          data: newHblCodes.map((hblCode) => ({ packageId, hblCode })),
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
