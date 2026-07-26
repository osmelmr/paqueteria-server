import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UpdateStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatusByBulk(
    hbls: string[],
    statusId?: string,
    locationId?: string,
  ) {
    /*
    este servicio debe encargarse de actualizar el estado y la localizacion de los paquetes que se encuentren en la base de datos, a partir de los hbls que se le pasen como parametro.
    Para ello, debe buscar en la base de datos los paquetes que tengan un hbl que se encuentre en el array de hbls, y actualizar su estado y localizacion a partir de la informacion que se encuentra en la tabla de estados y localizaciones.
    La logica de negocio es la siguiente:
    primero crea dis variables para guardar los hbls con sus paquetetes que seactualizaron correctamente
    y otro para guardar los hbls que no se pudieron actualizar

  (la mejor forma que se me ocure de verificar si existe algun paquete que coincida con algunos de esos 
  hbls es recorrer la lista de hbls y hacer una consulata por cada uno pero eso es segun mi opinion no si haya
  una forma mas eficiente
  )
  este servicio debe devolver en una respuesta, la lista de paquetes que fueron actualizados y la lista de hbls que no 
  fueron encontrados en la base de datos

    */

    const updated: Array<{ hbl: string; package: any }> = [];
    const notFound: string[] = [];

    // Validar statusId si fue proporcionado
    if (statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: statusId },
      });
      if (!status) {
        return {
          success: [],
          failed: hbls.map((hbl) => ({ hbl, error: 'Status no encontrado' })),
        };
      }
    }

    // Validar locationId si fue proporcionado
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        return {
          success: [],
          failed: hbls.map((hbl) => ({
            hbl,
            error: 'Ubicacion no encontrada',
          })),
        };
      }
    }

    // Recorrer la lista de hbls y buscar cada paquete
    for (const hbl of hbls) {
      try {
        const packageHbl = await this.prisma.packageHbl.findUnique({
          where: { hblCode: hbl },
          include: { package: true },
        });

        if (!packageHbl) {
          notFound.push(hbl);
          continue;
        }

        const updateData: Record<string, any> = {};
        if (statusId) updateData.statusId = statusId;
        if (locationId) updateData.locationId = locationId;

        if (Object.keys(updateData).length === 0) {
          // Si no se proporcionaron statusId ni locationId, no hay nada que actualizar
          notFound.push(hbl);
          continue;
        }

        // Actualizar el paquete dentro de una transaccion
        const updatedPkg = await this.prisma.$transaction(async (tx) => {
          const pkg = await tx.package.update({
            where: { id: packageHbl.packageId },
            data: updateData,
          });

          // Crear registro en el historial de estados si se actualizo el statusId
          if (statusId) {
            await tx.packageStatusHistory.create({
              data: {
                packageId: pkg.id,
                statusId,
              },
            });
          }

          return pkg;
        });

        updated.push({ hbl, package: updatedPkg });
      } catch (error) {
        notFound.push(hbl);
      }
    }

    return {
      success: updated,
      failed: notFound,
    };
  }
}
