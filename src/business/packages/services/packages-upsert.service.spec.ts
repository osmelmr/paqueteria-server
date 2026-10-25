import { PackagesUpsertService } from './packages-upsert.service.js';
import { BusinessService } from './business.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

type Row = Record<string, unknown>;

interface StoredPackage extends Row {
  id: string;
  statusId: string;
  locationId: string | null;
}

interface StoredHbl {
  hblCode: string;
  packageId: string;
}

const DEFAULT_META = {
  statusId: 'status-1',
  locationId: 'location-1',
  agencyId: 'agency-1',
};

function createHarness() {
  const state = {
    packages: [] as StoredPackage[],
    hbls: [] as StoredHbl[],
    history: [] as Row[],
    recipients: [] as Row[],
    guides: [
      { id: 'guide-1', name: 'GUIA-EXISTENTE', agencyId: 'agency-1' },
    ] as Row[],
    updates: [] as Row[],
    counter: 0,
  };

  const statusIds = ['status-1', 'status-2'];

  const refModel = (ids: string[]) => ({
    findUnique: ({ where }: { where: { id: string } }) =>
      ids.includes(where.id) ? { id: where.id } : null,
    findFirst: ({ where }: { where: { name: { contains: string } } }) => {
      const found = ids.find((id) =>
        id.toLowerCase().includes(where.name.contains.toLowerCase()),
      );
      return found ? { id: found } : null;
    },
    create: ({ data }: { data: Row }) => ({
      id: `created-${Object.keys(data).join('-')}`,
      ...data,
    }),
  });

  const prisma = {
    status: refModel(statusIds),
    location: refModel(['location-1']),
    agency: refModel(['agency-1']),
    province: refModel(['province-1']),
    municipe: refModel(['municipe-1']),
    guide: {
      findUnique: ({ where }: { where: { id?: string; name?: string } }) => {
        if (where.id) {
          return state.guides.find((g) => g.id === where.id) ?? null;
        }
        if (where.name) {
          return state.guides.find((g) => g.name === where.name) ?? null;
        }
        return null;
      },
      create: ({ data }: { data: Row }) => {
        const guide = { id: `guide-${state.guides.length + 1}`, ...data };
        state.guides.push(guide);
        return guide;
      },
    },
    recipient: {
      findFirst: ({ where }: { where: { idCard: { contains: string } } }) =>
        state.recipients.find((r) =>
          String(r.idCard).includes(where.idCard.contains),
        ) ?? null,
      create: ({ data }: { data: Row }) => {
        const recipient = {
          id: `recipient-${state.recipients.length + 1}`,
          ...data,
        };
        state.recipients.push(recipient);
        return recipient;
      },
    },
    package: {
      findUnique: ({ where }: { where: { id: string } }) =>
        state.packages.find((pkg) => pkg.id === where.id) ?? null,
      create: ({ data }: { data: Row }) => {
        const pkg = {
          id: `pkg-${state.packages.length + 1}`,
          ...data,
        } as StoredPackage;
        state.packages.push(pkg);
        return pkg;
      },
      update: ({ where, data }: { where: { id: string }; data: Row }) => {
        const pkg = state.packages.find((p) => p.id === where.id);
        if (!pkg) throw new Error('package not found');
        Object.assign(pkg, data);
        state.updates.push(data);
        return pkg;
      },
    },
    packageHbl: {
      findMany: ({
        where,
      }: {
        where: { hblCode: { in: string[] } };
      }): Array<{ hblCode: string; packageId: string }> =>
        state.hbls.filter((hbl) => where.hblCode.in.includes(hbl.hblCode)),
      createMany: ({ data }: { data: StoredHbl[] }) => {
        for (const row of data) {
          if (state.hbls.some((hbl) => hbl.hblCode === row.hblCode)) {
            // simula la restriccion de unicidad real de PackageHbl
            throw new Error(
              `Unique constraint failed on the constraint: \`${row.hblCode}\``,
            );
          }
          state.hbls.push(row);
        }
        return { count: data.length };
      },
    },
    packageStatusHistory: {
      create: ({ data }: { data: Row }) => {
        state.history.push(data);
        return data;
      },
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn(prisma),
  };

  const business = {
    resolveOrCreateNamedEntity: (_model: unknown, name: string): string =>
      `resolved-${name}`,
  } as unknown as BusinessService;

  const service = new PackagesUpsertService(
    prisma as unknown as PrismaService,
    business,
  );

  return { service, state };
}

describe('PackagesUpsertService.bulkUpsert', () => {
  it('crea los paquetes que no existen en el sistema', async () => {
    const { service, state } = createHarness();

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001'] }, { hblCodes: ['HBL-002'] }],
      DEFAULT_META,
      'user-1',
    );

    expect(result.total).toBe(2);
    expect(result.created).toHaveLength(2);
    expect(result.updated).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
    expect(state.packages).toHaveLength(2);
    expect(state.hbls.map((h) => h.hblCode)).toEqual(['HBL-001', 'HBL-002']);
    expect(state.history).toHaveLength(2);
    expect(state.packages[0]).toMatchObject({
      statusId: 'status-1',
      locationId: 'location-1',
    });
  });

  it('actualiza el paquete existente solo con los campos que vienen con valor', async () => {
    const { service, state } = createHarness();

    state.packages.push({
      id: 'pkg-existente',
      statusId: 'status-1',
      locationId: 'location-1',
      address: 'Direccion vieja',
      content: 'Contenido viejo',
    });
    state.hbls.push({ hblCode: 'HBL-001', packageId: 'pkg-existente' });

    const result = await service.bulkUpsert(
      [
        {
          hblCodes: ['HBL-001', 'HBL-009'],
          address: 'Direccion nueva',
          content: '',
          weight: 0,
        },
      ],
      DEFAULT_META,
      'user-1',
    );

    expect(result.created).toHaveLength(0);
    expect(result.updated).toEqual([
      { hblCodes: ['HBL-001', 'HBL-009'], packageId: 'pkg-existente' },
    ]);
    expect(result.failed).toHaveLength(0);

    const pkg = state.packages[0];
    expect(pkg.address).toBe('Direccion nueva');
    expect(pkg.content).toBe('Contenido viejo');
    expect(pkg).not.toHaveProperty('weight');
    // los metadatos del lote no pisan al paquete existente
    expect(state.updates[0]).not.toHaveProperty('statusId');
    expect(state.updates[0]).not.toHaveProperty('locationId');
    expect(state.updates[0]).not.toHaveProperty('guideId');
    // sin cambio de estado no se registra historial
    expect(state.history).toHaveLength(0);
    // el HBL nuevo queda asociado al mismo paquete
    expect(state.hbls.map((h) => h.hblCode)).toEqual(['HBL-001', 'HBL-009']);
  });

  it('registra historial cuando la fila trae un estado nuevo', async () => {
    const { service, state } = createHarness();

    state.packages.push({
      id: 'pkg-existente',
      statusId: 'status-1',
      locationId: 'location-1',
    });
    state.hbls.push({ hblCode: 'HBL-001', packageId: 'pkg-existente' });

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001'], statusId: 'status-2' }],
      DEFAULT_META,
      'user-1',
    );

    expect(result.updated).toHaveLength(1);
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({
      packageId: 'pkg-existente',
      statusId: 'status-2',
      userId: 'user-1',
    });
  });

  it('asocia la guia del lote a los paquetes nuevos', async () => {
    const { service, state } = createHarness();

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001'] }],
      { ...DEFAULT_META, guideId: 'guide-1' },
      'user-1',
    );

    expect(result.created).toHaveLength(1);
    expect(state.packages[0].guideId).toBe('guide-1');
  });

  it('crea la guia nueva si el nombre no existe todavía', async () => {
    const { service, state } = createHarness();

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001'] }],
      {
        ...DEFAULT_META,
        guide: 'LOTE-009',
        guideType: 'AEREA',
      },
      'user-1',
    );

    expect(result.created).toHaveLength(1);
    expect(state.guides).toHaveLength(2);
    expect(state.packages[0].guideId).toBe('guide-2');
  });

  it('falla cuando los HBLs pertenecen a paquetes distintos', async () => {
    const { service, state } = createHarness();

    state.packages.push(
      { id: 'pkg-1', statusId: 'status-1', locationId: 'location-1' },
      { id: 'pkg-2', statusId: 'status-1', locationId: 'location-1' },
    );
    state.hbls.push(
      { hblCode: 'HBL-001', packageId: 'pkg-1' },
      { hblCode: 'HBL-002', packageId: 'pkg-2' },
    );

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001', 'HBL-002'] }],
      DEFAULT_META,
      'user-1',
    );

    expect(result.created).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].error).toContain('paquetes distintos');
    expect(state.updates).toHaveLength(0);
  });

  it('marca como fallido el item sin HBL', async () => {
    const { service } = createHarness();

    const result = await service.bulkUpsert(
      [{ hblCodes: ['   '] }],
      DEFAULT_META,
      'user-1',
    );

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].error).toContain('no tiene HBL');
  });

  it('falla al crear si el lote no trae ubicacion', async () => {
    const { service, state } = createHarness();

    const result = await service.bulkUpsert(
      [{ hblCodes: ['HBL-001'] }],
      { statusId: 'status-1', agencyId: 'agency-1' },
      'user-1',
    );

    expect(result.created).toHaveLength(0);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].error).toContain('ubicación');
    expect(state.packages).toHaveLength(0);
  });
});
