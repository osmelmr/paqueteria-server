import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🌱 Starting seed...');

    // ─── 1. USERS ──────────────────────────────────────────
    console.log('📝 Creating users...');
    
    const adminHash = await bcrypt.hash('admin123', 10);
    const storekeeperHash = await bcrypt.hash('store123', 10);

    await pool.query(
      `INSERT INTO users (id, email, username, password, full_name, role, updated_at)
       VALUES (gen_random_uuid(), 'admin@paqueteria.com', 'admin', $1, 'Administrador', 'ADMIN', NOW())
       ON CONFLICT (username) DO UPDATE SET password = $1, role = 'ADMIN', updated_at = NOW()`,
      [adminHash]
    );

    await pool.query(
      `INSERT INTO users (id, email, username, password, full_name, role, updated_at)
       VALUES (gen_random_uuid(), 'almacen@paqueteria.com', 'storekeeper', $1, 'Encargado de Almacén', 'STOREKEEPER', NOW())
       ON CONFLICT (username) DO UPDATE SET password = $1, role = 'STOREKEEPER', updated_at = NOW()`,
      [storekeeperHash]
    );

    console.log('✅ Users created');

    // ─── 2. AGENCIES ──────────────────────────────────────
    console.log('📝 Creating agencies...');
    
    await pool.query(
      `INSERT INTO agencies (id, name)
       VALUES 
         (gen_random_uuid(), 'Agencia Central'),
         (gen_random_uuid(), 'Agencia Norte'),
         (gen_random_uuid(), 'Agencia Sur')
       ON CONFLICT (name) DO NOTHING`
    );
    console.log('✅ Agencies created');

    // ─── 3. GUIDES ─────────────────────────────────────────
    console.log('📝 Creating guides...');
    
    // Primero obtenemos los IDs de las agencias
    const agenciesResult = await pool.query('SELECT id, name FROM agencies');
    const agencyMap = {};
    agenciesResult.rows.forEach(row => {
      agencyMap[row.name] = row.id;
    });

    await pool.query(
      `INSERT INTO guides (id, external_ref, agency_id, uploaded_at)
       VALUES 
         (gen_random_uuid(), 'GUIDE-001', $1, NOW()),
         (gen_random_uuid(), 'GUIDE-002', $1, NOW()),
         (gen_random_uuid(), 'GUIDE-003', $2, NOW()),
         (gen_random_uuid(), 'GUIDE-004', $3, NOW())
       ON CONFLICT (external_ref) DO NOTHING`,
      [agencyMap['Agencia Central'], agencyMap['Agencia Norte'], agencyMap['Agencia Sur']]
    );
    console.log('✅ Guides created');

    // ─── 4. RECIPIENTS ────────────────────────────────────
    console.log('📝 Creating recipients...');
    
    await pool.query(
      `INSERT INTO recipients (id, full_name, id_card, phone)
       VALUES 
         (gen_random_uuid(), 'Juan Pérez', '123456789', '809-555-0101'),
         (gen_random_uuid(), 'María González', '987654321', '809-555-0102'),
         (gen_random_uuid(), 'Carlos Rodríguez', '456789123', '829-555-0103'),
         (gen_random_uuid(), 'Ana Martínez', '789123456', '849-555-0104')
       ON CONFLICT (id_card) DO NOTHING`
    );
    console.log('✅ Recipients created');

    // ─── 5. PROVINCES ──────────────────────────────────────
    console.log('📝 Creating provinces...');
    
    await pool.query(
      `INSERT INTO provinces (id, name)
       VALUES 
         (gen_random_uuid(), 'Distrito Nacional'),
         (gen_random_uuid(), 'Santo Domingo'),
         (gen_random_uuid(), 'Santiago'),
         (gen_random_uuid(), 'Puerto Plata'),
         (gen_random_uuid(), 'La Altagracia'),
         (gen_random_uuid(), 'San Cristóbal')
       ON CONFLICT (name) DO NOTHING`
    );
    console.log('✅ Provinces created');

    // ─── 6. STATUSES ──────────────────────────────────────
    console.log('📝 Creating statuses...');
    
    await pool.query(
      `INSERT INTO statuses (id, name)
       VALUES 
         (gen_random_uuid(), 'Registrado'),
         (gen_random_uuid(), 'En Tránsito'),
         (gen_random_uuid(), 'En Almacén'),
         (gen_random_uuid(), 'En Ruta de Entrega'),
         (gen_random_uuid(), 'Entregado'),
         (gen_random_uuid(), 'Devuelto')
       ON CONFLICT (name) DO NOTHING`
    );
    console.log('✅ Statuses created');

    // ─── 7. LOCATIONS ─────────────────────────────────────
    console.log('📝 Creating locations...');
    
    await pool.query(
      `INSERT INTO locations (id, name)
       VALUES 
         (gen_random_uuid(), 'Almacén Central'),
         (gen_random_uuid(), 'Almacén Norte'),
         (gen_random_uuid(), 'Almacén Sur'),
         (gen_random_uuid(), 'Punto de Recolección Este'),
         (gen_random_uuid(), 'Punto de Recolección Oeste')
       ON CONFLICT (name) DO NOTHING`
    );
    console.log('✅ Locations created');

    // ─── 8. PACKAGES ──────────────────────────────────────
    console.log('📝 Creating packages...');
    
    // Obtener todos los IDs necesarios
    const guidesResult = await pool.query('SELECT id, external_ref FROM guides');
    const guideMap = {};
    guidesResult.rows.forEach(row => {
      guideMap[row.external_ref] = row.id;
    });

    const recipientsResult = await pool.query('SELECT id, id_card FROM recipients');
    const recipientMap = {};
    recipientsResult.rows.forEach(row => {
      recipientMap[row.id_card] = row.id;
    });

    const provincesResult = await pool.query('SELECT id, name FROM provinces');
    const provinceMap = {};
    provincesResult.rows.forEach(row => {
      provinceMap[row.name] = row.id;
    });

    const statusesResult = await pool.query('SELECT id, name FROM statuses');
    const statusMap = {};
    statusesResult.rows.forEach(row => {
      statusMap[row.name] = row.id;
    });

    const locationsResult = await pool.query('SELECT id, name FROM locations');
    const locationMap = {};
    locationsResult.rows.forEach(row => {
      locationMap[row.name] = row.id;
    });

    // Insertar paquetes
    await pool.query(
      `INSERT INTO packages (
        id, guide_id, recipient_id, province_id, address, weight, content, 
        departure_date, arrival_date, status_id, location_id, created_at, updated_at
      )
      VALUES 
        (
          gen_random_uuid(), $1, $2, $3, 'Calle Principal #123, Ensanche Naco', 15.50, 'Electrónicos y accesorios',
          '2026-07-20', '2026-07-23', $4, $5, NOW(), NOW()
        ),
        (
          gen_random_uuid(), $1, $6, $7, 'Av. Independencia #456, Gazcue', 8.75, 'Documentos y libros',
          '2026-07-21', '2026-07-22', $8, $9, NOW(), NOW()
        ),
        (
          gen_random_uuid(), $10, $11, $12, 'Calle Beller #789, Los Jardines', 25.00, 'Equipos de oficina',
          '2026-07-19', '2026-07-24', $13, $14, NOW(), NOW()
        ),
        (
          gen_random_uuid(), $15, $16, $17, 'Playa Dorada #321, Puerto Plata', 12.30, 'Ropa y calzado',
          '2026-07-18', '2026-07-25', $18, $19, NOW(), NOW()
        )`,
      [
        guideMap['GUIDE-001'], recipientMap['123456789'], provinceMap['Distrito Nacional'], 
        statusMap['En Ruta de Entrega'], locationMap['Almacén Norte'],
        recipientMap['987654321'], provinceMap['Santo Domingo'], 
        statusMap['En Tránsito'], locationMap['Almacén Central'],
        guideMap['GUIDE-002'], recipientMap['456789123'], provinceMap['Santiago'], 
        statusMap['En Almacén'], locationMap['Almacén Sur'],
        guideMap['GUIDE-003'], recipientMap['789123456'], provinceMap['Puerto Plata'], 
        statusMap['Entregado'], locationMap['Punto de Recolección Este']
      ]
    );
    console.log('✅ Packages created');

    // ─── 9. PACKAGE HBLS ──────────────────────────────────
    console.log('📝 Creating HBL codes...');
    
    // Obtener IDs de los paquetes recién creados
    const packagesResult = await pool.query(
      `SELECT id FROM packages ORDER BY created_at LIMIT 4`
    );
    const packageIds = packagesResult.rows.map(row => row.id);

    await pool.query(
      `INSERT INTO package_hbls (id, package_id, hbl_code)
       VALUES 
         (gen_random_uuid(), $1, 'HBL-2026-001'),
         (gen_random_uuid(), $1, 'HBL-2026-002'),
         (gen_random_uuid(), $2, 'HBL-2026-003'),
         (gen_random_uuid(), $3, 'HBL-2026-004'),
         (gen_random_uuid(), $4, 'HBL-2026-005')
       ON CONFLICT (hbl_code) DO NOTHING`,
      [packageIds[0], packageIds[1], packageIds[2], packageIds[3]]
    );
    console.log('✅ HBL codes created');

    // ─── 10. PACKAGE STATUS HISTORY ──────────────────────
    console.log('📝 Creating status history...');
    
    // Obtener IDs nuevamente
    const packagesForHistory = await pool.query(
      `SELECT id FROM packages ORDER BY created_at LIMIT 4`
    );
    const pkgIds = packagesForHistory.rows.map(row => row.id);

    // Insertar historial de estados para cada paquete
    await pool.query(
      `INSERT INTO package_status_history (id, package_id, status_id, created_at)
       VALUES 
         -- Paquete 1: Registrado -> En Tránsito -> En Almacén -> En Ruta de Entrega
         (gen_random_uuid(), $1, $2, '2026-07-20 08:00:00'),
         (gen_random_uuid(), $1, $3, '2026-07-20 14:30:00'),
         (gen_random_uuid(), $1, $4, '2026-07-21 09:15:00'),
         (gen_random_uuid(), $1, $5, '2026-07-22 10:00:00'),
         -- Paquete 2: Registrado -> En Tránsito
         (gen_random_uuid(), $6, $2, '2026-07-21 09:00:00'),
         (gen_random_uuid(), $6, $3, '2026-07-21 16:45:00'),
         -- Paquete 3: Registrado -> En Almacén
         (gen_random_uuid(), $7, $2, '2026-07-19 10:30:00'),
         (gen_random_uuid(), $7, $4, '2026-07-19 15:20:00'),
         -- Paquete 4: Registrado -> En Tránsito -> En Almacén -> Entregado
         (gen_random_uuid(), $8, $2, '2026-07-18 08:30:00'),
         (gen_random_uuid(), $8, $3, '2026-07-18 13:10:00'),
         (gen_random_uuid(), $8, $4, '2026-07-19 09:45:00'),
         (gen_random_uuid(), $8, $9, '2026-07-20 11:30:00')`,
      [
        pkgIds[0], statusMap['Registrado'], statusMap['En Tránsito'], 
        statusMap['En Almacén'], statusMap['En Ruta de Entrega'],
        pkgIds[1], pkgIds[2], pkgIds[3], statusMap['Entregado']
      ]
    );
    console.log('✅ Status history created');

    // ─── 11. REFRESH TOKENS ──────────────────────────────
    console.log('📝 Creating refresh token...');
    
    const adminUser = await pool.query(
      `SELECT id FROM users WHERE username = 'admin'`
    );
    const adminId = adminUser.rows[0]?.id;

    if (adminId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await pool.query(
        `INSERT INTO refresh_tokens (id, token, user_id, expires_at, created_at)
         VALUES (gen_random_uuid(), 'sample-refresh-token-1234567890', $1, $2, NOW())
         ON CONFLICT (token) DO NOTHING`,
        [adminId, expiresAt]
      );
      console.log('✅ Refresh token created');
    }

    // ─── SUMMARY ──────────────────────────────────────────
    console.log('🎉 Seed completed successfully!');
    
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM agencies) as agencies,
        (SELECT COUNT(*) FROM guides) as guides,
        (SELECT COUNT(*) FROM recipients) as recipients,
        (SELECT COUNT(*) FROM provinces) as provinces,
        (SELECT COUNT(*) FROM statuses) as statuses,
        (SELECT COUNT(*) FROM locations) as locations,
        (SELECT COUNT(*) FROM packages) as packages,
        (SELECT COUNT(*) FROM package_hbls) as hbls,
        (SELECT COUNT(*) FROM package_status_history) as history
    `);
    
    console.log('📊 Summary:', counts.rows[0]);

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);