import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const res = await pool.query("SELECT username, role, password FROM users WHERE username='admin'");
if (res.rows.length === 0) {
  console.log('No admin user found');
} else {
  const user = res.rows[0];
  console.log('User:', user.username, 'Role:', user.role);
  console.log('Password hash:', user.password);
  let found = false;
  for (const pwd of ['admin123', '123456', 'admin', 'password', 'Administrador']) {
    const match = await bcrypt.compare(pwd, user.password);
    if (match) { console.log('MATCHED password:', pwd); found = true; }
  }
  if (!found) console.log('No match for any common password');
}
await pool.end();
