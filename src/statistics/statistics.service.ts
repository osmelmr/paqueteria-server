import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async main() {
    // buscar los ids de los estados relevantes
    const [almacenadoStatus, entregadoStatus, esperaStatus] = await Promise.all([
      this.prisma.status.findFirst({
        // buscar por contains 'almace' para cubrir variantes como 'almacen' o 'almacenado'
        where: { name: { contains: 'almace', mode: 'insensitive' } },
      }),
      this.prisma.status.findFirst({
        where: { name: { equals: 'entregado', mode: 'insensitive' } },
      }),
      this.prisma.status.findFirst({
        where: { name: { contains: 'espera', mode: 'insensitive' } },
      }),
    ]);

    const [almacenados, entregados, guiasActivas, enEspera, ultimasRutas] =
      await Promise.all([
        this.prisma.package.count({
          where: almacenadoStatus
            ? { statusId: almacenadoStatus.id }
            : { status: { name: { contains: 'almace', mode: 'insensitive' } } },
        }),
        this.prisma.package.count({
          where: entregadoStatus
            ? { statusId: entregadoStatus.id }
            : { status: { name: { equals: 'entregado', mode: 'insensitive' } } },
        }),
        this.prisma.guide.count(),
        this.prisma.package.count({
          where: esperaStatus
            ? { statusId: esperaStatus.id }
            : {
                status: {
                  name: {
                    contains: 'espera',
                    mode: 'insensitive',
                  },
                },
              },
        }),
        this.prisma.route.findMany({
          orderBy: { departureDate: 'desc' },
          take: 5,
          include: {
            vehicle: true,
            _count: { select: { packages: true } },
          },
        }),
      ]);

    return {
      totalAlmacenados: almacenados,
      totalEntregados: entregados,
      totalGuiasActivas: guiasActivas,
      totalEnEspera: enEspera,
      ultimasRutas,
      // ids de estados para que el frontend pueda enlazarlos directamente
      idAlmacenado: almacenadoStatus ? almacenadoStatus.id : null,
      idEntregado: entregadoStatus ? entregadoStatus.id : null,
      idEnEspera: esperaStatus ? esperaStatus.id : null,
    };
  }
}
