import { Injectable } from '@nestjs/common';
import { AiClientService } from './ai-client.service.js';
import { EntityResolverService } from './entity-resolver.service.js';
import { SinglePackageEntryDto } from '../dto/single-package-entry.dto.js';
import { PreviewRequestDto } from '../dto/preview-request.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AiPreviewService {
  constructor(
    private aiClient: AiClientService,
    private entityResolver: EntityResolverService,
    private prisma: PrismaService,
  ) {}

  async generatePreview(
    dto: PreviewRequestDto,
  ): Promise<{ packages: SinglePackageEntryDto[] }> {
    // 1. Extraer datos del Excel (puede ser llamada a IA o mock)
    const extracted = await this.aiClient.extractPackagesFromExcel(
      dto.excelText,
    );

    // 2. Resolver o crear la guía UNA SOLA VEZ para todo el lote
    let guideId: string | null = null;

    // Prioridad: si viene guideId en el DTO, lo usamos directamente
    if (dto.guideId) {
      guideId = dto.guideId;
    } else if (dto.externalRef && dto.agencyId) {
      // Buscar si ya existe una guía con esos datos
      const existingGuide = await this.prisma.guide.findFirst({
        where: {
          externalRef: dto.externalRef,
          agencyId: dto.agencyId,
        },
      });

      if (existingGuide) {
        guideId = existingGuide.id;
      } else {
        // Crear nueva guía
        const newGuide = await this.prisma.guide.create({
          data: {
            externalRef: dto.externalRef,
            agencyId: dto.agencyId,
          },
        });
        guideId = newGuide.id;
      }
      console.log(guideId);
    }
    // Si no se cumple ninguna condición, guideId queda null

    // 3. Resolver el resto de entidades y armar los DTOs para cada paquete
    const resolvedPackages = await Promise.all(
      extracted.map(async (item) => {
        const provinceId = await this.entityResolver.resolveProvince(
          item.province,
        );
        const recipientId = await this.entityResolver.resolveRecipient(
          item.idCard,
          item.fullName,
          item.phone,
        );

        const singleDto: SinglePackageEntryDto = {
          address: item.address ?? null,
          content: item.content ?? undefined,
          departureDate: item.departureDate ?? undefined,
          hblCodes: item.hblCodes ?? [],
          weight: item.weight ?? null,
          statusId: dto.statusId,
          locationId: dto.locationId,
          provinceId,
          recipientId,
          isOrphan: dto.isOrphan ?? false,
          guideId: guideId, // Se usa el mismo guideId para todos
        };

        return singleDto;
      }),
    );

    return { packages: resolvedPackages };
  }
}
