import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🌱 Seeding locations...');

    const locations = [
      'Almacén Central',
      'Almacén Norte',
      'Almacén Sur',
      'Almacén Este',
      'Almacén Oeste',
      'Punto de Recolección Zona Colonial',
      'Punto de Recolección Gazcue',
      'Punto de Recolección Naco',
      'Punto de Recolección Piantini',
      'Oficina Principal',
      'Centro de Distribución',
      'Bodega Secundaria'
    ];

    let insertedCount = 0;
    let existingCount = 0;

    for (const locationName of locations) {
      // Verificar si existe
      const checkResult = await pool.query(
        'SELECT id FROM locations WHERE name = $1',
        [locationName]
      );

      if (checkResult.rows.length === 0) {
        // No existe, insertar
        await pool.query(
          'INSERT INTO locations (id, name) VALUES (gen_random_uuid(), $1)',
          [locationName]
        );
        insertedCount++;
        console.log(`✅ Location created: ${locationName}`);
      } else {
        existingCount++;
        console.log(`⏭️ Location already exists: ${locationName}`);
      }
    }

    console.log(`\n📊 Summary: ${insertedCount} new locations created, ${existingCount} already existed`);

    // Mostrar todas las ubicaciones existentes
    const result = await pool.query('SELECT id, name FROM locations ORDER BY name');
    console.log('\n📋 All locations in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.id})`);
    });

    console.log('\n🎉 Locations seeded successfully!');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);