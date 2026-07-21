import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const hash = await bcrypt.hash('admin123', 10);
  const res = await pool.query(
    `INSERT INTO users (id, email, username, password, full_name, role, updated_at)
     VALUES (gen_random_uuid(), 'admin@paqueteria.com', 'admin', $1, 'Administrador', 'ADMIN', NOW())
     ON CONFLICT (username) DO UPDATE SET password = $1, role = 'ADMIN', updated_at = NOW()`,
    [hash],
  );
  console.log('Admin user:', res.rowCount > 0 ? 'created' : 'already exists');
  await pool.end();
}

main().catch(console.error);
