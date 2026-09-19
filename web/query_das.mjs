import { neon } from '@neondatabase/serverless';

const sql1 = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
const sql2 = neon('postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-divine-scene-az33au23-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

(async () => {
  try {
    const r1 = await sql1`SELECT * FROM user_profiles WHERE email = 'dasrupam942@gmail.com'`;
    console.log('DB1 user_profiles:', r1);
  } catch (e) { console.log('DB1 user_profiles error', e.message); }
  
  try {
    const r2 = await sql2`SELECT * FROM user_profiles WHERE email = 'dasrupam942@gmail.com'`;
    console.log('DB2 user_profiles:', r2);
  } catch (e) { console.log('DB2 user_profiles error', e.message); }

})();
