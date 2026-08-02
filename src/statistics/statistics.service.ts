import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async main() {
    const [almacenados, entregados, guiasActivas, enEspera, ultimasRutas] =
      await Promise.all([
        this.prisma.package.count({
          where: { status: { name: 'almacenado' } },
        }),
        this.prisma.package.count({
          where: { status: { name: 'entregado' } },
        }),
        this.prisma.guide.count(),
        this.prisma.package.count({
          where: { status: { name: { notIn: ['entregado', 'perdido'] } } },
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
    };
  }
}
