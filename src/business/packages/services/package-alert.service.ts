import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PackageAlertService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAlert(
    packageId: string,
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
      anotations?: string;
      alertDescription?: string;
      hbls?: string[];
    },
  ) {
    const existing = await this.prisma.package.findUnique({
      where: { id: packageId },
    });
    if (!existing) {
      return {
        success: false,
        message: 'Package no encontrado',
      };
    }

    const changedFields: Record<string, any> = {};
    const fieldsToCompare: Record<string, keyof typeof data> = {
      guideId: 'guideId',
      recipientId: 'recipientId',
      provinceId: 'provinceId',
      address: 'address',
      weight: 'weight',
      content: 'content',
      statusId: 'statusId',
      locationId: 'locationId',
      anotations: 'anotations',
      alertDescription: 'alertDescription',
    };

    for (const [field, key] of Object.entries(fieldsToCompare)) {
      const newValue = data[key];
      if (newValue === undefined) continue;
      const currentValue = (existing as any)[field];
      if (String(newValue) !== String(currentValue)) {
        changedFields[field] = newValue;
      }
    }

    if (data.arrivalDate !== undefined) {
      const newDate = new Date(data.arrivalDate);
      if (newDate.getTime() !== existing.arrivalDate?.getTime()) {
        changedFields.arrivalDate = newDate;
      }
    }

    if (Object.keys(changedFields).length === 0) {
      return {
        success: false,
        message:
          'Ningun campo fue modificado, no se puede desactivar la alerta sin cambios reales',
      };
    }

    changedFields.alert = false;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.hbls && data.hbls.length > 0) {
        const conflicting = await tx.packageHbl.findMany({
          where: {
            hblCode: { in: data.hbls },
            packageId: { not: packageId },
          },
          select: { hblCode: true },
        });
        if (conflicting.length > 0) {
          throw new BadRequestException(
            `Los siguientes HBL ya están en uso: ${conflicting.map((h) => h.hblCode).join(', ')}`,
          );
        }
        await tx.packageHbl.deleteMany({ where: { packageId } });
        await tx.packageHbl.createMany({
          data: data.hbls.map((hbl) => ({ packageId, hblCode: hbl })),
        });
      }

      const pkg = await tx.package.update({
        where: { id: packageId },
        data: changedFields,
      });

      return pkg;
    });

    return {
      success: true,
      message: 'Alerta resuelta, cambios aplicados',
      package: await this.prisma.package.findUnique({
        where: { id: packageId },
        include: {
          hbls: true,
          recipient: true,
          province: true,
          status: true,
          location: true,
          guide: true,
        },
      }),
    };
  }
}
