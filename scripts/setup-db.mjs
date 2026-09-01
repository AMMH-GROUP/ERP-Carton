// scripts/setup-db.mjs
// Run: node scripts/setup-db.mjs
// This script:
//   1. Runs all SQL migrations on Supabase
//   2. Creates the Super Admin user
//   3. Assigns the Super Admin role

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://idthgfrytexurokjxppp.supabase.co';
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdGhnZnJ5dGV4dXJva2p4cHBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3NzY3NiwiZXhwIjoyMTAzODUzNjc2fQ.zBUXhAAZHWFlgTuPZwqaGjtj7KkfoSQED-tGYWHIxpE';
const DB_PASSWORD       = process.env.DB_PASSWORD || process.argv[2];

// Admin credentials to create
const ADMIN_EMAIL       = 'admin@carton-erp.com';
const ADMIN_PASSWORD    = 'Admin@123456';
const ADMIN_FULL_NAME   = 'مدير النظام الرئيسي';

// ─── MIGRATIONS (in order) ────────────────────────────────────────────────────
const MIGRATION_FILES = [
  '001_identity_access.sql',
  '002_system.sql',
  '003_master_data.sql',
  '004_inventory.sql',
  '005_sales.sql',
  '006_purchasing.sql',
  '007_manufacturing_qc.sql',
  '008_finance.sql',
  '009_maintenance.sql',
  '010_functions.sql',
  '012_rls_policies.sql',
  '013_seed_data.sql',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

// ─── STEP 1: Run Migrations via pg ───────────────────────────────────────────
async function runMigrations() {
  if (!DB_PASSWORD) {
    console.error('\n❌ DB password is required!');
    console.error('Usage: node scripts/setup-db.mjs <DB_PASSWORD>\n');
    process.exit(1);
  }

  const client = new Client({
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: `postgres.idthgfrytexurokjxppp`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  log('🔌', 'Connecting to Supabase PostgreSQL...');
  await client.connect();
  log('✅', 'Connected!');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

  for (const file of MIGRATION_FILES) {
    const filePath = join(migrationsDir, file);
    let sql;
    try {
      sql = readFileSync(filePath, 'utf-8');
    } catch {
      log('⚠️ ', `Skipping ${file} (not found)`);
      continue;
    }

    log('🗃️ ', `Running ${file}...`);
    try {
      await client.query(sql);
      log('✅', `${file} done`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        log('⏭️ ', `${file} — already applied, skipping`);
      } else {
        log('⚠️ ', `${file} warning: ${err.message.substring(0, 120)}`);
      }
    }
  }

  await client.end();
  log('🔐', 'DB connection closed');
}

// ─── STEP 2: Create Super Admin User ─────────────────────────────────────────
async function createAdminUser() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  log('\n👤', `Creating admin user: ${ADMIN_EMAIL}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);

  let userId;

  if (existing) {
    log('⏭️ ', `User ${ADMIN_EMAIL} already exists — using existing user`);
    userId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_FULL_NAME }
    });

    if (error) {
      log('❌', `Failed to create user: ${error.message}`);
      process.exit(1);
    }

    userId = data.user.id;
    log('✅', `User created! ID: ${userId}`);
  }

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: ADMIN_FULL_NAME,
    email: ADMIN_EMAIL,
    is_active: true,
    preferred_language: 'ar',
  }, { onConflict: 'id' });

  if (profileError) {
    log('⚠️ ', `Profile upsert warning: ${profileError.message}`);
  } else {
    log('✅', 'Profile created/updated');
  }

  // Get Super Admin role ID
  const { data: roles, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name_en', 'Super Admin')
    .single();

  if (roleError || !roles) {
    log('❌', `Could not find Super Admin role: ${roleError?.message}`);
    log('💡', 'Make sure migrations ran successfully (seed data creates roles)');
    process.exit(1);
  }

  // Assign Super Admin role
  const { error: assignError } = await supabase.from('user_roles').upsert({
    user_id: userId,
    role_id: roles.id,
    is_active: true,
  }, { onConflict: 'user_id,role_id' });

  if (assignError) {
    log('⚠️ ', `Role assignment warning: ${assignError.message}`);
  } else {
    log('✅', 'Super Admin role assigned!');
  }

  return userId;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏭  Carton ERP — Database Setup Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run migrations
  await runMigrations();

  // Create admin user
  const userId = await createAdminUser();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎉  Setup Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  📧  Email    : ${ADMIN_EMAIL}`);
  console.log(`  🔑  Password : ${ADMIN_PASSWORD}`);
  console.log(`  🆔  User ID  : ${userId}`);
  console.log(`  🌐  App URL  : http://localhost:3005\n`);
  console.log('  ➡️   Go to http://localhost:3005/login and sign in!\n');
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
