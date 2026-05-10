'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || key === 'placeholder') {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env first');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const username = 'admin';
  const password = 'admin123';
  const email    = 'admin@rabbitspoker.com';

  console.log('Hashing password…');
  const password_hash = await bcrypt.hash(password, 10);

  console.log('Upserting admin user…');
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { username, email, password_hash, chips: 999999, is_admin: true, is_banned: false },
      { onConflict: 'username' }
    )
    .select('id, username, is_admin')
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Hint:', error.hint);
    process.exit(1);
  }

  console.log('✅ Admin user ready:');
  console.log(`   Username : ${data.username}`);
  console.log(`   Password : ${password}`);
  console.log(`   Admin    : ${data.is_admin}`);
  console.log(`   ID       : ${data.id}`);

  // Also update the ADMIN_PASSWORD_HASH env hint
  console.log(`\nAdd this to Railway env vars:`);
  console.log(`   ADMIN_PASSWORD_HASH=${password_hash}`);
}

main();
