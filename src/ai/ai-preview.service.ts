import { Injectable } from '@nestjs/common';
import { AiClientService } from './ai-client.service.js';
import { PreviewRequestDto } from './dto/preview-request.dto.js';
import { ExtractedPackageDto } from './dto/extracted-package.dto.js';

@Injectable()
export class AiPreviewService {
  constructor(private aiClient: AiClientService) {}

  async extractPackages(
    dto: PreviewRequestDto,
  ): Promise<{ packages: ExtractedPackageDto[] }> {
    const extracted = await this.aiClient.extractPackagesFromExcel(
      dto.excelText,
    );

    const normalized = extracted.map((item) => {
      // Normalizar ID Card: solo dígitos
      const idCard = item.idCard ? item.idCard.replace(/\D/g, '') : undefined;

      // Normalizar teléfono: solo dígitos
      const phone = item.phone ? item.phone.replace(/\D/g, '') : undefined;

      // Normalizar HBL codes: mayúsculas y trim
      const hblCodes = Array.isArray(item.hblCodes)
        ? item.hblCodes.map((code: string) => code.trim().toUpperCase())
        : [];

      // Peso como número
      const weight = typeof item.weight === 'number' ? item.weight : undefined;

      return {
        address: item.address || undefined,
        content: item.content || undefined,
        fullName: item.fullName || undefined,
        idCard,
        phone,
        province: item.province || undefined,
        municipe: item.municipe || undefined,
        arrivalDate: item.arrivalDate || undefined,
        hblCodes,
        weight,
      };
    });

    return { packages: normalized };
  }
}
