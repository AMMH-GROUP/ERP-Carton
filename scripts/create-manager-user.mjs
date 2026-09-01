// scripts/create-manager-user.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://idthgfrytexurokjxppp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdGhnZnJ5dGV4dXJva2p4cHBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3NzY3NiwiZXhwIjoyMTAzODUzNjc2fQ.zBUXhAAZHWFlgTuPZwqaGjtj7KkfoSQED-tGYWHIxpE';

const MANAGER_EMAIL     = 'manager@carton-erp.com';
const MANAGER_PASSWORD  = 'Manager@123456';
const MANAGER_NAME      = 'مدير المصنع التنفيذي';

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === MANAGER_EMAIL);

  let userId;
  if (existing) {
    userId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: MANAGER_EMAIL,
      password: MANAGER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: MANAGER_NAME }
    });
    if (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
  }

  await supabase.from('profiles').upsert({
    id: userId,
    full_name: MANAGER_NAME,
    email: MANAGER_EMAIL,
    is_active: true,
    preferred_language: 'ar',
  }, { onConflict: 'id' });

  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name_en', 'Factory Manager')
    .single();

  if (role) {
    await supabase.from('user_roles').upsert({
      user_id: userId,
      role_id: role.id,
      is_active: true,
    }, { onConflict: 'user_id,role_id' });
  }

  console.log('✅ Factory Manager account ready!');
}

main();
