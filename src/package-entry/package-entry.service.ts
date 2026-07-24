import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PackageEntryService {
    constructor(private prisma: PrismaService) { }

    async createEntry(dto: {
        statusId: string;
        guideRef?: string;
        address?: string;
        weight?: number;
        content?: string;
        departureDate?: string;
        isOrphan?: boolean;
        recipient?: { id?: string; data?: Record<string, unknown> };
        guide?: { id?: string; data?: Record<string, unknown> };
        province?: { id?: string; data?: Record<string, unknown> };
        location?: { id?: string; data?: Record<string, unknown> };
        hbls?: Array<{ hblCode: string }>;
    }) {
        return this.prisma.$transaction(async (tx: any) => {
            const status = await tx.status.findUnique({
                where: { id: dto.statusId },
            });
            if (!status) {
                throw new NotFoundException('Status not found');
            }

            const resolveRelation = async (
                relation: { id?: string; data?: Record<string, unknown> } | undefined,
                model: 'recipient' | 'guide' | 'province' | 'location',
                createData?: Record<string, unknown>,
            ) => {
                if (!relation) return null;

                if (relation.id) {
                    const existing = await tx[model].findUnique({
                        where: { id: relation.id },
                    });
                    if (!existing) {
                        throw new NotFoundException(`${model} not found`);
                    }
                    return relation.id;
                }

                if (relation.data) {
                    const created = await tx[model].create({ data: relation.data });
                    return created.id;
                }

                return null;
            };

            const recipientId = await resolveRelation(dto.recipient, 'recipient');
            const guideId = await resolveRelation(dto.guide, 'guide');
            const provinceId = await resolveRelation(dto.province, 'province');
            const locationId = await resolveRelation(dto.location, 'location');

            const pkg = await tx.package.create({
                data: {
                    statusId: dto.statusId,
                    recipientId,
                    guideId,
                    provinceId,
                    locationId,
                    address: dto.address,
                    weight: dto.weight,
                    content: dto.content,
                    departureDate: dto.departureDate
                        ? new Date(dto.departureDate)
                        : undefined,
                    isOrphan: dto.isOrphan ?? false,
                },
            });

            if (dto.hbls && dto.hbls.length > 0) {
                await tx.packageHbl.createMany({
                    data: dto.hbls.map((hbl) => ({
                        packageId: pkg.id,
                        hblCode: hbl.hblCode,
                    })),
                });
            }

            return tx.package.findUnique({
                where: { id: pkg.id },
                include: {
                    hbls: true,
                    recipient: true,
                    province: true,
                    status: true,
                    location: true,
                    guide: true,
                },
            });
        });
    }
}
