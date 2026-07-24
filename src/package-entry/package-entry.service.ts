import { Injectable } from '@nestjs/common';
import { PackageProcessorService } from './package-processor.service.js';
import { SinglePackageEntryDto } from './dto/single-package-entry.dto.js';

export interface BatchResult {
    index: number;
    packageId?: string;
    data?: Record<string, unknown>;
    error?: string;
}

@Injectable()
export class PackageEntryService {
    constructor(
        private readonly packageProcessor: PackageProcessorService,
    ) { }

    async createEntry(dto: SinglePackageEntryDto) {
        return this.packageProcessor.processPackage(dto);
    }

    async processBatch(packages: SinglePackageEntryDto[]) {
        const successful: BatchResult[] = [];
        const failed: BatchResult[] = [];

        for (let i = 0; i < packages.length; i++) {
            const item = packages[i];

            try {
                const result = await this.packageProcessor.processPackage(item);

                successful.push({
                    index: i,
                    packageId: result.id,
                    data: {
                        id: result.id,
                        address: result.address,
                        weight: result.weight,
                        recipient: result.recipient?.fullName ?? null,
                        status: result.status?.name ?? null,
                        hbls: result.hbls.map((h) => h.hblCode),
                    },
                });
            } catch (error) {
                failed.push({
                    index: i,
                    error: (error as Error).message,
                    data: item as unknown as Record<string, unknown>,
                });
            }
        }

        return {
            summary: {
                total: packages.length,
                saved: successful.length,
                failed: failed.length,
                successRate:
                    packages.length > 0
                        ? `${((successful.length / packages.length) * 100).toFixed(2)}%`
                        : '0%',
            },
            successful,
            failed,
            savedIds: successful.map((s) => s.packageId),
        };
    }
}
