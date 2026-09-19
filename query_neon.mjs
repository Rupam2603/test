globalThis.importMetaEnv = {
  VITE_NEON_DATABASE_URL: 'postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
};
// Polyfill import.meta.env
import { neon } from '@neondatabase/serverless';

const sql = neon(globalThis.importMetaEnv.VITE_NEON_DATABASE_URL);

(async () => {
  try {
    const retailer_approvals = await sql`SELECT * FROM retailer_approvals`;
    console.log('retailer_approvals rows:', retailer_approvals);

    const profiles = await sql`SELECT id, email, full_name, role, approval_status, shop_name FROM profiles WHERE role = 'retailer' OR approval_status = 'pending'`;
    console.log('profiles rows:', profiles);

    const user_profiles = await sql`SELECT id, email, full_name, role, approval_status, shop_name FROM user_profiles WHERE role = 'retailer' OR approval_status = 'pending'`;
    console.log('user_profiles rows:', user_profiles);
  } catch (err) {
    console.error('SQL Error:', err);
  }
})();
