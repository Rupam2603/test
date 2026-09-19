import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

(async () => {
  try {
    const users = await sql`SELECT id, name, email, role FROM users`;
    console.log('users count:', users.length);
    console.log(users);
  } catch (err) {
    console.error('users err:', err.message);
  }
})();
