import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🌱 Seeding statuses...');

    // ─── STATUSES ──────────────────────────────────────
    const statuses = [
      'Registrado',
      'En Tránsito',
      'En Almacén',
      'En Ruta de Entrega',
      'Entregado',
      'Devuelto',
      'En Aduana',
      'Liberado',
      'En Espera',
      'Cancelado'
    ];

    let insertedCount = 0;
    for (const statusName of statuses) {
      const result = await pool.query(
        `INSERT INTO statuses (id, name)
         VALUES (gen_random_uuid(), $1)
         ON CONFLICT (name) DO NOTHING`,
        [statusName]
      );
      
      if (result.rowCount > 0) {
        insertedCount++;
        console.log(`✅ Status created: ${statusName}`);
      } else {
        console.log(`⏭️ Status already exists: ${statusName}`);
      }
    }

    console.log(`📊 Summary: ${insertedCount} new statuses created`);

    // Mostrar todos los estados existentes
    const result = await pool.query('SELECT id, name FROM statuses ORDER BY name');
    console.log('\n📋 All statuses in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.id})`);
    });

    console.log('\n🎉 Statuses seeded successfully!');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);