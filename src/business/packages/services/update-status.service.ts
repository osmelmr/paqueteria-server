import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { normalizeHbl } from '../../../common/utils/normalize-hbls.js';

@Injectable()
export class UpdateStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatusByBulk(
    hbls: string[],
    statusId?: string,
    locationId?: string,
    statusDate?: string,
  ) {
    // 1. Normalizar y limpiar la lista de HBLs
    const normalizedHbls = hbls
      .map((h) => normalizeHbl(h))
      .filter((h) => h.length > 0);
    const uniqueHbls = [...new Set(normalizedHbls)];

    // 2. Validar statusId y locationId (una sola vez)
    if (statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: statusId },
      });
      if (!status) {
        return {
          success: [],
          failed: hbls.map((h) => ({ hbl: h, error: 'Status no encontrado' })),
        };
      }
    }
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        return {
          success: [],
          failed: hbls.map((h) => ({
            hbl: h,
            error: 'Ubicación no encontrada',
          })),
        };
      }
    }

    // 3. Si no se proporciona ningún ID, devolver todos los HBLs encontrados (sin cambios)
    if (!statusId && !locationId) {
      const allPackageHbls = await this.prisma.packageHbl.findMany({
        where: { hblCode: { in: uniqueHbls } },
        include: { package: true },
      });
      const foundMap = new Map(
        allPackageHbls.map((item) => [item.hblCode, item.package]),
      );
      const success: Array<{ hbl: string; package: any }> = [];
      const failed: string[] = [];
      for (const hbl of hbls) {
        const norm = normalizeHbl(hbl);
        const pkg = foundMap.get(norm);
        if (pkg) {
          success.push({ hbl, package: pkg });
        } else {
          failed.push(hbl);
        }
      }
      return { success, failed };
    }

    // 4. Búsqueda exacta de todos los packageHbl en UNA sola consulta
    const packageHbls = await this.prisma.packageHbl.findMany({
      where: { hblCode: { in: uniqueHbls } },
      include: { package: true },
    });

    const hblMap = new Map(packageHbls.map((item) => [item.hblCode, item]));

    const success: Array<{ hbl: string; package: any }> = [];
    const failed: string[] = [];

    // 5. Procesar cada HBL (usando el mapa para O(1))
    for (const hbl of hbls) {
      const normalized = normalizeHbl(hbl);
      const packageHbl = hblMap.get(normalized);

      if (!packageHbl) {
        failed.push(hbl);
        continue;
      }

      const effectiveLocationId = locationId ?? packageHbl.package.locationId;
      const sameStatus = statusId
        ? statusId === packageHbl.package.statusId
        : true;
      const sameLocation =
        effectiveLocationId === packageHbl.package.locationId;

      // Si ya tiene los mismos valores, se considera éxito (sin cambios)
      if (sameStatus && sameLocation) {
        success.push({ hbl, package: packageHbl.package });
        continue;
      }

      // Preparar datos de actualización
      const updateData: { statusId?: string; locationId?: string } = {};
      if (statusId) updateData.statusId = statusId;
      if (locationId) updateData.locationId = locationId;

      // Actualizar en transacción (con historial si cambia status)
      try {
        const updatedPkg = await this.prisma.$transaction(async (tx) => {
          const pkg = await tx.package.update({
            where: { id: packageHbl.packageId },
            data: updateData,
          });

          if (statusId) {
            const historyLocationId =
              locationId ?? packageHbl.package.locationId ?? null;
            if (!historyLocationId) {
              throw new Error('Paquete sin ubicación conocida');
            }
            await tx.packageStatusHistory.create({
              data: {
                packageId: pkg.id,
                statusId,
                locationId: historyLocationId,
                createdAt: statusDate ?? new Date().toISOString(),
              },
            });
          }
          return pkg;
        });

        success.push({ hbl, package: updatedPkg });
      } catch {
        failed.push(hbl);
      }
    }

    return { success, failed };
  }
}
