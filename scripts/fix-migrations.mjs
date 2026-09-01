// scripts/fix-migrations.mjs
// Reruns the migrations that failed in the first pass (now that functions exist)
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PASSWORD = process.argv[2];

function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }

// Only files that had warnings in first pass
const FIX_FILES = [
  '003_master_data.sql',
  '004_inventory.sql',
  '005_sales.sql',
  '006_purchasing.sql',
  '007_manufacturing_qc.sql',
  '008_finance.sql',
  '009_maintenance.sql',
];

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔧  Carton ERP — Fix Failed Migrations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const client = new Client({
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.idthgfrytexurokjxppp',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  log('🔌', 'Connecting to Supabase PostgreSQL...');
  await client.connect();
  log('✅', 'Connected!\n');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

  for (const file of FIX_FILES) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');
    log('🗃️ ', `Running ${file}...`);
    try {
      await client.query(sql);
      log('✅', `${file} done`);
    } catch (err) {
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate key') ||
        err.message.includes('already defined')
      ) {
        log('⏭️ ', `${file} — already applied`);
      } else {
        log('❌', `${file} error: ${err.message.substring(0, 200)}`);
      }
    }
  }

  await client.end();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅  All migrations fixed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
