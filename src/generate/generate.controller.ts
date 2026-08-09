import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GenerateService } from './generate.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { Request, Response } from 'express';

@Controller('generate')
@UseGuards(JwtAuthGuard)
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Get('pdf/:id')
  async generatePackagePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const { buffer, filename } =
        await this.generateService.generatePackagePdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', buffer.length);

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      if (error.status === 404) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        console.error('Error al generar PDF:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error al generar el PDF',
        });
      }
    }
  }

  @Get('excel/:id')
  async generateExcel(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.generateService.generateExcel(
        id,
        (req.user as { fullName?: string } | undefined)?.fullName,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
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
