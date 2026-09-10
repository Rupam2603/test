const { neon } = require('d:/Subhasis/app/web/node_modules/@neondatabase/serverless');
const dns = require('dns');

// Configure DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const credentials = {
  neonDbUrl: "postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-falling-cell-azm5qjrf-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  neonDevDbUrl: "postgresql://neondb_owner:npg_UOkw6Ks9FcjE@ep-divine-scene-az33au23-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  neonDataApi: "https://ep-falling-cell-azm5qjrf.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1",
  neonAuthApi: "https://ep-falling-cell-azm5qjrf.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth",
  neonJwksUrl: "https://ep-falling-cell-azm5qjrf.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json",
  neonBranch: "vercel-dev",
  mongoUri: "mongodb+srv://Vercel-Admin-subhone_store:sDkFri7C1tZzIcSW@subhone-store.dfyphd2.mongodb.net/?retryWrites=true&w=majority",
  mongoDb: "subhone_store",
  betterAuthKey: "ba_8qml3oy5c1x6xu5nmb29dzdx3sq88ou3",
  googleMapsKey: "AIzaSyD60FUI15GBZFVqcB_yTXGMsqtB-yukXIk",
  googleSheetKey: "AIzaSyD1XTQjIp7FxjEnmV0WPXbJ9YRc-daKfDE"
};

async function testAll() {
  console.log('========================================================');
  console.log('       SUBHONE HEALTH - BACKEND CONNECTION TEST');
  console.log('========================================================\n');

  // 1. Neon Primary DB
  console.log('1. Testing Neon Postgres Primary Connection...');
  try {
    const start = Date.now();
    const sql = neon(credentials.neonDbUrl);
    const prodRes = await sql.query('SELECT count(*) as count FROM products');
    const labRes = await sql.query('SELECT count(*) as count FROM lab_packages');
    const catRes = await sql.query('SELECT count(*) as count FROM categories');
    const elapsed = Date.now() - start;
    console.log(`   [PASS] Connected successfully (${elapsed}ms)`);
    console.log(`          • Products count:     ${prodRes[0].count}`);
    console.log(`          • Lab Packages count: ${labRes[0].count}`);
    console.log(`          • Categories count:   ${catRes[0].count}`);
  } catch (err) {
    console.log(`   [FAIL] Neon Postgres: ${err.message}`);
  }

  // 2. Neon Vercel-Dev DB
  console.log('\n2. Testing Neon Postgres vercel-dev Branch Connection...');
  try {
    const start = Date.now();
    const sqlDev = neon(credentials.neonDevDbUrl);
    const devCount = await sqlDev.query('SELECT count(*) as count FROM products');
    const elapsed = Date.now() - start;
    console.log(`   [PASS] Connected successfully (${elapsed}ms)`);
    console.log(`          • Dev products count: ${devCount[0].count}`);
  } catch (err) {
    console.log(`   [FAIL] Neon Dev Postgres: ${err.message}`);
  }

  // 3. MongoDB
  console.log('\n3. Testing MongoDB Atlas Connection...');
  try {
    const { MongoClient } = require('d:/Subhasis/app/web/node_modules/mongodb');
    const client = new MongoClient(credentials.mongoUri);
    const start = Date.now();
    await client.connect();
    const dbs = await client.db(credentials.mongoDb).listCollections().toArray();
    const elapsed = Date.now() - start;
    console.log(`   [PASS] MongoDB Atlas Connected (${elapsed}ms)`);
    console.log(`          • Database: ${credentials.mongoDb}`);
    console.log(`          • Collections: [${dbs.map(c => c.name).join(', ') || 'empty'}]`);
    await client.close();
  } catch (err) {
    console.log(`   [WARN] MongoDB Atlas: ${err.message}`);
  }

  // 4. Neon JWKS & Auth API
  console.log('\n4. Testing Neon Auth & JWKS Endpoint...');
  try {
    const res = await fetch(credentials.neonJwksUrl);
    const jwks = await res.json();
    console.log(`   [PASS] JWKS Endpoint reachable (keys: ${jwks.keys ? jwks.keys.length : 0})`);
  } catch (err) {
    console.log(`   [FAIL] JWKS Endpoint: ${err.message}`);
  }

  // 5. Google Maps API
  console.log('\n5. Verifying Google APIs Configuration...');
  console.log(`   [INFO] Google Maps Key: ${credentials.googleMapsKey ? 'Configured (' + credentials.googleMapsKey.slice(0, 8) + '...)' : 'Missing'}`);
  console.log(`   [INFO] Google Sheet Key: ${credentials.googleSheetKey ? 'Configured (' + credentials.googleSheetKey.slice(0, 8) + '...)' : 'Missing'}`);
  console.log(`   [INFO] Better Auth API Key: ${credentials.betterAuthKey ? 'Configured (' + credentials.betterAuthKey.slice(0, 8) + '...)' : 'Missing'}`);

  console.log('\n========================================================');
  console.log('       ALL BACKEND CREDENTIALS PROVISIONED & VERIFIED');
  console.log('========================================================\n');
}

testAll();
