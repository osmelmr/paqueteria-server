import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { GenerateService } from './generate.service.js';
import type { Response } from 'express';

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Get('excel/:id')
  async generateExcel(@Param('id') id: string, @Res() res: Response) {
    try {
      const buffer = await this.generateService.generateExcel(id);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=paquetes_ruta_${id}.xlsx`,
      );
      res.setHeader('Content-Length', buffer.length);

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      if (error.status === 404) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error al generar el Excel',
        });
      }
    }
  }
}
