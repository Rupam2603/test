import { neon } from '@neondatabase/serverless';

(async () => {
  try {
    const sql = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    await sql`UPDATE retailer_approvals SET approval_status = 'approved' FROM user_profiles WHERE (retailer_approvals.user_id = user_profiles.id OR retailer_approvals.email = user_profiles.email OR retailer_approvals.phone = user_profiles.phone) AND user_profiles.role = 'retailer'`;
    console.log('Update successful');
  } catch (err) {
    console.error('Error:', err);
  }
})();
