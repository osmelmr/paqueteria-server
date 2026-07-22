import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const statuses = [
  { name: 'entregando', category: 'en_camino' },
  { name: 'trasladando', category: 'traslado' },
  { name: 'almacenado', category: 'almacen' },
  { name: 'entregado', category: 'entregado' },
  { name: 'perdido', category: 'perdido' },
];

const locations = [
  { name: 'En camino', type: 'en_camino' },
  { name: 'Desde almacén hasta almacén', type: 'traslado' },
  { name: 'Desde recibo hasta almacén', type: 'traslado' },
  { name: 'Almacén Habana', type: 'almacen' },
  { name: 'Almacén Bayamo', type: 'almacen' },
  { name: 'Almacén Santiago de Cuba', type: 'almacen' },
  { name: 'Almacén Santa Clara', type: 'almacen' },
  { name: 'Almacén Camagüey', type: 'almacen' },
  { name: 'Almacén Holguín', type: 'almacen' },
  { name: 'Entregado al cliente', type: 'cliente' },
  { name: 'Desconocido', type: 'desconocido' },
];

async function main() {
  console.log('Seeding statuses…');
  for (const s of statuses) {
    const existing = await prisma.status.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.status.create({ data: s });
      console.log(`  Created status: ${s.name} (${s.category})`);
    } else {
      console.log(`  Skipped status: ${s.name} (already exists)`);
    }
  }

  console.log('Seeding locations…');
  for (const l of locations) {
    const existing = await prisma.location.findFirst({ where: { name: l.name } });
    if (!existing) {
      await prisma.location.create({ data: l });
      console.log(`  Created location: ${l.name} (${l.type})`);
    } else {
      console.log(`  Skipped location: ${l.name} (already exists)`);
    }
  }

  const statusCount = await prisma.status.count();
  const locationCount = await prisma.location.count();
  console.log(`\nDone. ${statusCount} statuses, ${locationCount} locations in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
