import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
        message: 'Ningun campo fue modificado, no se puede desactivar la alerta sin cambios reales',
      };
    }

    changedFields.alert = false;

    const updated = await this.prisma.package.update({
      where: { id: packageId },
      data: changedFields,
      include: {
        hbls: true,
        recipient: true,
        province: true,
        status: true,
        location: true,
        guide: true,
      },
    });

    return {
      success: true,
      message: 'Alerta resuelta, cambios aplicados',
      package: updated,
    };
  }
}
