import { PackageEntryService } from './package-entry.service.js';

describe('PackageEntryService', () => {
    it('creates a package and its hbls inside a transaction', async () => {
        const packageRecord = {
            id: 'pkg-1',
            statusId: 'status-1',
            recipientId: 'recipient-1',
            guideId: null,
            provinceId: null,
            locationId: null,
            addressDetail: 'Calle 1',
            weight: 2.5,
            contentDescription: 'Ropa',
            departureDate: '2026-07-24',
            isOrphan: false,
            hbls: [{ id: 'hbl-1', hblCode: 'HBL-1' }],
        };

        const tx = {
            status: {
                findUnique: jest.fn().mockResolvedValue({ id: 'status-1' }),
            },
            recipient: {
                findUnique: jest.fn().mockResolvedValue({ id: 'recipient-1' }),
            },
            guide: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            province: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            location: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            package: {
                create: jest.fn().mockResolvedValue({ id: 'pkg-1' }),
                findUnique: jest.fn().mockResolvedValue(packageRecord),
            },
            packageHbl: {
                createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };

        const prisma = {
            $transaction: jest.fn().mockImplementation(async (callback: any) => callback(tx)),
        };

        const service = new PackageEntryService(prisma as any);

        const result = await service.createEntry({
            statusId: 'status-1',
            recipient: { id: 'recipient-1' },
            guide: {},
            province: {},
            location: {},
            addressDetail: 'Calle 1',
            weight: 2.5,
            contentDescription: 'Ropa',
            departureDate: '2026-07-24',
            isOrphan: false,
            hbls: [{ hblCode: 'HBL-1' }],
        } as any);

        expect(prisma.$transaction).toHaveBeenCalled();
        expect(tx.status.findUnique).toHaveBeenCalledWith({ where: { id: 'status-1' } });
        expect(tx.package.create).toHaveBeenCalled();
        expect(tx.packageHbl.createMany).toHaveBeenCalledWith({
            data: [{ packageId: 'pkg-1', hblCode: 'HBL-1' }],
        });
        expect(result).toEqual(packageRecord);
    });
});
