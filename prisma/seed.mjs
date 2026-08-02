import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const UUID = (n) => {
  const h = n.toString(16).padStart(8, '0');
  return `${h}-0000-0000-0000-000000000000`;
};

const STATUS_IDS = {
  entregando:  UUID(1), trasladando: UUID(2), almacenado: UUID(3),
  entregado:   UUID(4), perdido:     UUID(5),
};
const LOCATION_IDS = {
  'En camino':                    UUID(10),
  'Desde almacén hasta almacén':  UUID(11),
  'Desde recibo hasta almacén':   UUID(12),
  'Almacén Habana':               UUID(13),
  'Almacén Bayamo':               UUID(14),
  'Almacén Santiago de Cuba':     UUID(15),
  'Almacén Santa Clara':          UUID(16),
  'Almacén Camagüey':             UUID(17),
  'Almacén Holguín':              UUID(18),
  'Entregado al cliente':         UUID(19),
  'Desconocido':                  UUID(20),
};
const PROVINCE_IDS = {
  'La Habana':        UUID(30),
  'Santiago de Cuba': UUID(31),
  'Holguín':          UUID(32),
  'Camagüey':         UUID(33),
  'Granma':           UUID(34),
};
const RECIPIENT_IDS = {
  '87031200123': UUID(40),
  '92051800456': UUID(41),
  '85070400789': UUID(42),
};
const AGENCY_IDS = {
  'DHL Cuba': UUID(45),
  'FedEx Cuba': UUID(46),
  'Correos Cuba': UUID(47),
};
const ADMIN_ID = UUID(90);
const GUIDE_ID = UUID(50);
const PACKAGE_IDS = [UUID(60), UUID(61), UUID(62)];

async function main() {
  // ── 1. Statuses ──────────────────────────────────
  console.log('Seeding statuses…');
  const statusNames = ['entregando', 'trasladando', 'almacenado', 'entregado', 'perdido'];
  for (const name of statusNames) {
    const id = STATUS_IDS[name];
    const { rowCount } = await pool.query(
      `INSERT INTO statuses (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [id, name],
    );
    console.log(rowCount > 0 ? `  Created status: ${name}` : `  Skipped status: ${name}`);
  }

  // ── 2. Locations ─────────────────────────────────
  console.log('Seeding locations…');
  const locationNames = [
    'En camino', 'Desde almacén hasta almacén', 'Desde recibo hasta almacén',
    'Almacén Habana', 'Almacén Bayamo', 'Almacén Santiago de Cuba',
    'Almacén Santa Clara', 'Almacén Camagüey', 'Almacén Holguín',
    'Entregado al cliente', 'Desconocido',
  ];
  for (const name of locationNames) {
    const id = LOCATION_IDS[name];
    const { rowCount } = await pool.query(
      `INSERT INTO locations (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [id, name],
    );
    console.log(rowCount > 0 ? `  Created location: ${name}` : `  Skipped location: ${name}`);
  }

  // ── 3. Provinces ─────────────────────────────────
  console.log('Seeding provinces…');
  for (const [name] of [
    ['La Habana'], ['Santiago de Cuba'], ['Holguín'], ['Camagüey'], ['Granma'],
  ]) {
    const id = PROVINCE_IDS[name];
    const { rowCount } = await pool.query(
      `INSERT INTO provinces (id, name) VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [id, name],
    );
    console.log(rowCount > 0 ? `  Created province: ${name}` : `  Skipped province: ${name}`);
  }

  // ── 4. Recipients ────────────────────────────────
  console.log('Seeding recipients…');
  const recipientData = [
    ['María García',     '87031200123', '555-1001'],
    ['Carlos Martínez',  '92051800456', '555-2002'],
    ['Ana Rodríguez',    '85070400789', '555-3003'],
  ];
  for (const [fullName, idCard, phone] of recipientData) {
    const id = RECIPIENT_IDS[idCard];
    const { rowCount } = await pool.query(
      `INSERT INTO recipients (id, full_name, id_card, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [id, fullName, idCard, phone],
    );
    console.log(rowCount > 0 ? `  Created recipient: ${fullName}` : `  Skipped recipient: ${fullName}`);
  }

  // ── 5. Agencies ─────────────────────────────────
  console.log('Seeding agencies…');
  const AGENCY_TYPES = {
    'DHL Cuba': 'AEREA',
    'FedEx Cuba': 'AEREA',
    'Correos Cuba': 'MARITIMA',
  };
  for (const [name, id] of Object.entries(AGENCY_IDS)) {
    const { rowCount } = await pool.query(
      `INSERT INTO agencies (id, name, type) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [id, name, AGENCY_TYPES[name]],
    );
    console.log(rowCount > 0 ? `  Created agency: ${name}` : `  Skipped agency: ${name}`);
  }

  // ── 6. Guide ─────────────────────────────────────
  console.log('Seeding guide…');
  const { rowCount: guideRc } = await pool.query(
    `INSERT INTO guides (id, external_ref, agency_id, uploaded_at)
     VALUES ($1, 'EXT-2026-001', $2, '2026-07-20T10:00:00Z')
     ON CONFLICT (id) DO NOTHING`,
    [GUIDE_ID, AGENCY_IDS['DHL Cuba']],
  );
  console.log(guideRc > 0 ? '  Created guide: EXT-2026-001' : '  Skipped guide');

  // ── 7. Packages ──────────────────────────────────
  console.log('Seeding packages…');
  const packages = [
    {
      idx: 0, recipientCard: '87031200123', provinceName: 'La Habana',
      weight: 3.5, content: 'Ropa y calzado',
      status: 'almacenado', location: 'Almacén Habana',
      hbls: ['HBL-23-001', 'HBL-23-002'],
      arrival: '2026-07-18',
    },
    {
      idx: 1, recipientCard: '92051800456', provinceName: 'Santiago de Cuba',
      weight: 7.2, content: 'Electrodomésticos',
      status: 'entregando', location: 'En camino',
      hbls: ['HBL-23-003'],
      arrival: '2026-07-19',
    },
    {
      idx: 2, recipientCard: '85070400789', provinceName: 'Holguín',
      weight: 1.8, content: 'Documentos y medicinas',
      status: 'trasladando', location: 'Desde recibo hasta almacén',
      hbls: ['HBL-23-004', 'HBL-23-005'],
      arrival: '2026-07-20',
    },
  ];
  for (const p of packages) {
    const id = PACKAGE_IDS[p.idx];
    const { rowCount } = await pool.query(
      `INSERT INTO packages (id, guide_id, recipient_id, province_id,
        weight, content, arrival_date, status_id, location_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [id, GUIDE_ID, RECIPIENT_IDS[p.recipientCard], PROVINCE_IDS[p.provinceName],
       p.weight, p.content, p.arrival,
       STATUS_IDS[p.status], LOCATION_IDS[p.location]],
    );
    if (rowCount === 0) {
      console.log(`  Skipped package: ${id}`);
      continue;
    }
    for (const hbl of p.hbls) {
      await pool.query(
        `INSERT INTO package_hbls (id, package_id, hbl_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (hbl_code) DO NOTHING`,
        [crypto.randomUUID(), id, hbl],
      );
    }
    console.log(`  Created package: ${id} (${p.hbls.join(', ')})`);
  }

  // ── 8. Admin user ────────────────────────────────
  console.log('Seeding admin user…');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO users (id, email, username, password, full_name, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'ADMIN', true, NOW(), NOW())
     ON CONFLICT (username) DO UPDATE
       SET password = EXCLUDED.password,
           role = 'ADMIN',
           is_active = true,
           updated_at = NOW()`,
    [ADMIN_ID, 'admin@paqueteria.com', 'admin', hashedPassword, 'Administrador'],
  );
  console.log('  Created/updated admin user (admin / admin123)');

  // ── Summary ──────────────────────────────────────
  const { rows: counts } = await pool.query(`
    SELECT 'users' AS tbl, COUNT(*)::int AS cnt FROM users
    UNION ALL SELECT 'statuses', COUNT(*) FROM statuses
    UNION ALL SELECT 'locations', COUNT(*) FROM locations
    UNION ALL SELECT 'provinces', COUNT(*) FROM provinces
    UNION ALL SELECT 'recipients', COUNT(*) FROM recipients
    UNION ALL SELECT 'guides', COUNT(*) FROM guides
    UNION ALL SELECT 'packages', COUNT(*) FROM packages
    UNION ALL SELECT 'package_hbls', COUNT(*) FROM package_hbls
  `);
  for (const r of counts) {
    console.log(`  ${r.tbl}: ${r.cnt}`);
  }
  console.log('\nSeed complete.');

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
