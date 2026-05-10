'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'rabbsroom';

  const password_hash = await bcrypt.hash(password, 10);
  const verified = await bcrypt.compare(password, password_hash);
  if (!verified) throw new Error('Hash verification failed — aborting');

  const { data, error } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('username', username)
    .select('id, username')
    .single();

  if (error) {
    console.error('❌ Supabase error:', error.message);
    process.exit(1);
  }

  console.log(`✅ Password updated for: ${data.username}`);
  console.log(`   New password : ${password}`);
  console.log(`   Hash         : ${password_hash}`);
  console.log(`\nAdd to Railway env vars:`);
  console.log(`   ADMIN_PASSWORD_HASH=${password_hash}`);
}

main();
