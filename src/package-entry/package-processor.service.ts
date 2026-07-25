import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ProcessPackageInput {
  statusId: string;
  address?: string;
  weight?: number;
  content?: string;
  departureDate?: string;
  isOrphan?: boolean;
  recipientId?: string;
  guideId?: string | null;
  provinceId?: string;
  locationId?: string;
  newRecipient?: {
    fullName: string;
    idCard: string;
    phone?: string;
  };
  // newGuide ha sido eliminado
  newProvince?: {
    name: string;
  };
  newLocation?: {
    name: string;
  };
  hblCodes?: string[];
}

export interface ProcessPackageResult {
  id: string;
  guideId: string | null;
  recipientId: string | null;
  provinceId: string | null;
  address: string | null;
  weight: number | null;
  content: string | null;
  departureDate: string | null;
  statusId: string;
  locationId: string | null;
  isOrphan: boolean;
  createdAt: string;
  recipient: {
    id: string;
    fullName: string;
    idCard: string;
    phone: string | null;
  } | null;
  guide: {
    id: string;
    externalRef: string;
    agencyId: string;
  } | null;
  province: {
    id: string;
    name: string;
  } | null;
  status: {
    id: string;
    name: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  hbls: Array<{
    id: string;
    hblCode: string;
  }>;
}

@Injectable()
export class PackageProcessorService {
  constructor(private prisma: PrismaService) {}

  async processPackage(
    input: ProcessPackageInput,
  ): Promise<ProcessPackageResult> {
    return this.prisma.$transaction(async (tx: any) => {
      // Validar status
      const status = await tx.status.findUnique({
        where: { id: input.statusId },
      });
      if (!status) {
        throw new NotFoundException(
          `Status with id "${input.statusId}" not found`,
        );
      }

      // Resolver Recipient
      let recipientId: string | null = input.recipientId ?? null;
      if (!recipientId && input.newRecipient) {
        const created = await tx.recipient.create({ data: input.newRecipient });
        recipientId = created.id;
      } else if (recipientId) {
        const existing = await tx.recipient.findUnique({
          where: { id: recipientId },
        });
        if (!existing) {
          throw new NotFoundException(
            `Recipient with id "${recipientId}" not found`,
          );
        }
      }

      // Resolver Guide (solo validación, nunca se crea aquí)
      const guideId: string | null = input.guideId ?? null;
      if (guideId) {
        const existing = await tx.guide.findUnique({
          where: { id: guideId },
        });
        if (!existing) {
          throw new NotFoundException(`Guide with id "${guideId}" not found`);
        }
      }

      // Resolver Province
      let provinceId: string | null = input.provinceId ?? null;
      if (!provinceId && input.newProvince) {
        const created = await tx.province.create({ data: input.newProvince });
        provinceId = created.id;
      } else if (provinceId) {
        const existing = await tx.province.findUnique({
          where: { id: provinceId },
        });
        if (!existing) {
          throw new NotFoundException(
            `Province with id "${provinceId}" not found`,
          );
        }
      }

      // Resolver Location
      let locationId: string | null = input.locationId ?? null;
      if (!locationId && input.newLocation) {
        const created = await tx.location.create({ data: input.newLocation });
        locationId = created.id;
      } else if (locationId) {
        const existing = await tx.location.findUnique({
          where: { id: locationId },
        });
        if (!existing) {
          throw new NotFoundException(
            `Location with id "${locationId}" not found`,
          );
        }
      }

      // Crear Package
      const pkg = await tx.package.create({
        data: {
          statusId: input.statusId,
          recipientId,
          guideId,
          provinceId,
          locationId,
          address: input.address ?? null,
          weight: input.weight ?? null,
          content: input.content ?? null,
          departureDate: input.departureDate
            ? new Date(input.departureDate)
            : null,
          isOrphan: input.isOrphan ?? false,
        },
      });

      // Asociar HBLs
      if (input.hblCodes && input.hblCodes.length > 0) {
        await tx.packageHbl.createMany({
          data: input.hblCodes.map((code) => ({
            packageId: pkg.id,
            hblCode: code,
          })),
          skipDuplicates: true,
        });
      }

      // Historial de estado
      await tx.packageStatusHistory.create({
        data: {
          packageId: pkg.id,
          statusId: input.statusId,
        },
      });

      // Devolver paquete con relaciones
      return tx.package.findUnique({
        where: { id: pkg.id },
        include: {
          hbls: true,
          recipient: true,
          province: true,
          status: true,
          location: true,
          guide: {
            include: {
              agency: true,
            },
          },
        },
      });
    });
  }
}
