import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import ExcelJS from 'exceljs';

@Injectable()
export class GenerateService {
  constructor(private readonly prisma: PrismaService) {}

  async generateExcel(
    routeId: string,
    deliveredBy?: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!routeId) {
      throw new NotFoundException('El ID de la ruta es requerido');
    }

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        vehicle: true,
        drivers: {
          include: {
            driver: true,
          },
        },
        packages: {
          include: {
            recipient: true,
            province: true,
            municipe: true,
            status: true,
            location: true,
            hbls: true,
            guide: {
              include: {
                agency: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${routeId} no encontrada`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Paquetes');

    // Configurar ancho de columnas
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 18;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 15;

    // Fila 1: Título MIPYME
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'MIPYME TRANSPORTACIONES RODRIGEZ RIZO';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { bold: true, size: 16 };

    // Filas 2-4: Información de la ruta
    const cellA2 = worksheet.getCell('A2');
    cellA2.value = 'ENTREGADO POR:';
    cellA2.font = { bold: true };

    const cellB2 = worksheet.getCell('B2');
    cellB2.value = deliveredBy || 'No especificado';

    const cellA3 = worksheet.getCell('A3');
    cellA3.value = 'TRANSPORTADO POR:';
    cellA3.font = { bold: true };

    const driversNames = route.drivers.map((d) => d.driver.name).join(', ');
    const cellB3 = worksheet.getCell('B3');
    cellB3.value = driversNames || 'No especificado';

    const cellA4 = worksheet.getCell('A4');
    cellA4.value = 'RECIBIDO POR:';
    cellA4.font = { bold: true };

    worksheet.getCell('B4').value = '';

    // Fila 6: Encabezados de la tabla
    const headerRow = worksheet.getRow(6);
    headerRow.getCell(1).value = 'Nombre y apellidos';
    headerRow.getCell(2).value = 'HBL';
    headerRow.getCell(3).value = 'Peso';
    headerRow.getCell(4).value = 'C.I.';
    headerRow.getCell(5).value = 'Móvil';
    headerRow.getCell(6).value = 'Dirección';
    headerRow.getCell(7).value = 'Provincia';
    headerRow.getCell(8).value = 'Municipio';
    headerRow.getCell(9).value = 'Firma';

    // Aplicar estilo a los encabezados
    for (let col = 1; col <= 9; col++) {
      const cell = headerRow.getCell(col);
      cell.font = { bold: true, size: 11 };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Datos de paquetes
    let currentRow = 7;
    let totalWeight = 0;

    const sortedPackages = [...route.packages].sort((a, b) => {
      const nameA = a.recipient?.fullName || '';
      const nameB = b.recipient?.fullName || '';
      return nameA.localeCompare(nameB);
    });

    for (const pkg of sortedPackages) {
      const row = worksheet.getRow(currentRow);

      const weight = pkg.weight ? Number(pkg.weight) : 0;
      totalWeight += weight;

      row.getCell(1).value = pkg.recipient?.fullName || 'Sin destinatario';
      row.getCell(2).value =
        pkg.hbls.length > 0 ? pkg.hbls[0].hblCode : 'Sin HBL';
      row.getCell(3).value = weight;
      row.getCell(4).value = pkg.recipient?.idCard || 'Sin CI';
      row.getCell(5).value = pkg.recipient?.phone || 'Sin móvil';
      row.getCell(6).value = pkg.address || 'Sin dirección';
      row.getCell(7).value = pkg.province?.name || 'Sin provincia';
      row.getCell(8).value = pkg.municipe?.name || 'Sin municipio';
      row.getCell(9).value = '';

      // Aplicar estilo a cada celda
      for (let col = 1; col <= 9; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { color: { argb: 'FF008000' }, size: 10 };
      }

      // Ajuste especial para columnas de texto
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

      currentRow++;
    }

    // Fila de total
    if (route.packages.length > 0) {
      const totalRow = worksheet.getRow(currentRow);

      totalRow.getCell(1).value = 'PESO TOTAL:';
      totalRow.getCell(1).font = { bold: true, size: 11 };
      totalRow.getCell(1).alignment = {
        horizontal: 'right',
        vertical: 'middle',
      };

      totalRow.getCell(3).value = totalWeight;
      totalRow.getCell(3).font = { bold: true, size: 11 };
      totalRow.getCell(3).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      for (let col = 1; col <= 9; col++) {
        const cell = totalRow.getCell(col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (col !== 1 && col !== 3) {
          cell.value = '';
        }
      }
    }

    // Información adicional al pie
    const infoRow = worksheet.getRow(currentRow + 2);
    infoRow.getCell(1).value = `Total de paquetes: ${route.packages.length}`;
    infoRow.getCell(1).font = { italic: true, size: 9 };
    infoRow.getCell(1).alignment = { horizontal: 'left' };

    const dateRow = worksheet.getRow(currentRow + 3);
    dateRow.getCell(1).value =
      `Generado: ${new Date().toLocaleString('es-ES')}`;
    dateRow.getCell(1).font = { italic: true, size: 9 };
    dateRow.getCell(1).alignment = { horizontal: 'left' };

    // Generar buffer y retornar con el tipo correcto
    const buffer = await workbook.xlsx.writeBuffer();
    const safeName = route.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const filename = `${safeName || 'ruta'}.xlsx`;
    return { buffer: Buffer.from(buffer), filename };
  }
}
