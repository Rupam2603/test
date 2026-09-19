import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

(async () => {
  try {
    const auth_users = await sql`SELECT * FROM auth_users LIMIT 10`;
    console.log('auth_users count:', auth_users.length);
    console.log(auth_users);
  } catch (err) {
    console.error('auth_users error:', err.message);
  }
})();
