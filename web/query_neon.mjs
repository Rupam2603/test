import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

(async () => {
  try {
    await sql`ALTER TABLE retailer_approvals ALTER COLUMN email DROP NOT NULL`;
    await sql`ALTER TABLE retailer_approvals ALTER COLUMN shop_name DROP NOT NULL`;
    const schema = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'retailer_approvals'`;
    console.log(schema);
  } catch (err) {
    console.error('SQL Error:', err);
  }
})();
