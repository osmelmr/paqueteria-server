import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Generar un UUID v4 compatible con tu base de datos
function generateUUID() {
  return crypto.randomUUID();
}

// IDs fijos para consistencia (puedes cambiarlos)
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440000'; // UUID fijo o usa generateUUID()

async function main() {
  console.log('🚀 Creando usuario administrador...');

  // Obtener contraseña desde variables de entorno o generar una temporal
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Datos del administrador
  const adminData = {
    id: ADMIN_ID,
    email: process.env.ADMIN_EMAIL || 'admin@paqueteria.com',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: hashedPassword,
    fullName: process.env.ADMIN_NAME || 'Administrador',
    role: 'ADMIN',
    isActive: true,
  };

  try {
    // Insertar o actualizar el usuario administrador
    const { rowCount } = await pool.query(
      `INSERT INTO users (id, email, username, password, full_name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (username) DO UPDATE
         SET email = EXCLUDED.email,
             password = EXCLUDED.password,
             full_name = EXCLUDED.full_name,
             role = EXCLUDED.role,
             is_active = EXCLUDED.is_active,
             updated_at = NOW()`,
      [
        adminData.id,
        adminData.email,
        adminData.username,
        adminData.password,
        adminData.fullName,
        adminData.role,
        adminData.isActive,
      ]
    );

    if (rowCount > 0) {
      console.log('✅ Administrador creado exitosamente');
    } else {
      console.log('ℹ️ Administrador actualizado exitosamente');
    }

    // Mostrar credenciales
    console.log('\n📋 Credenciales del administrador:');
    console.log(`   Usuario: ${adminData.username}`);
    console.log(`   Email: ${adminData.email}`);
    
    if (process.env.ADMIN_PASSWORD) {
      console.log('   Contraseña: Usando la definida en ADMIN_PASSWORD');
    } else {
      console.log(`   Contraseña temporal: ${adminPassword}`);
      console.log('   ⚠️  ¡Cambia esta contraseña al iniciar sesión!');
    }

    // Verificar que el usuario fue creado
    const { rows: users } = await pool.query(
      `SELECT id, username, email, role, is_active FROM users WHERE username = $1`,
      [adminData.username]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('\n✅ Verificación:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Usuario: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Activo: ${user.is_active}`);
    }

    console.log('\n✨ Seed de administrador completado.');
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Error en el seed:', e);
  process.exit(1);
});