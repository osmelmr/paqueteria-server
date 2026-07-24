import { Injectable } from '@nestjs/common';
import { AiClientService } from './ai-client.service.js';
import { EntityResolverService } from './entity-resolver.service.js';
import { SinglePackageEntryDto } from '../dto/single-package-entry.dto.js';
import { PreviewRequestDto } from '../dto/preview-request.dto.js';

@Injectable()
export class AiPreviewService {
  constructor(
    private aiClient: AiClientService,
    private entityResolver: EntityResolverService,
  ) {}

  async generatePreview(
    dto: PreviewRequestDto,
  ): Promise<{ packages: SinglePackageEntryDto[] }> {
    const extracted = await this.aiClient.extractPackagesFromExcel(
      dto.excelText,
    );

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
          content: item.content ?? null,
          departureDate: item.departureDate ?? null,
          hblCodes: item.hblCodes ?? [],
          weight: item.weight ?? null,
          statusId: dto.statusId,
          locationId: dto.locationId,
          provinceId,
          recipientId,
          isOrphan: dto.isOrphan ?? false,
          newGuide: {
            agencyId: dto.agencyId,
            externalRef: dto.externalRef,
          },
        };

        return singleDto;
      }),
    );

    return { packages: resolvedPackages };
  }
}
