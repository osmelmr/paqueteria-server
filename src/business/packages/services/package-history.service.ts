import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PackageHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async history(packageId: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      select: { id: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    return this.prisma.packageStatusHistory.findMany({
      where: { packageId },
      include: { status: true, location: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(packageId: string, historyId: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      select: { id: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const entry = await this.prisma.packageStatusHistory.findFirst({
      where: { id: historyId, packageId },
    });
    if (!entry) {
      throw new NotFoundException('Movimiento de historial no encontrado');
    }

    await this.prisma.packageStatusHistory.delete({ where: { id: historyId } });
    return { success: true };
  }
}
