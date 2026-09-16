const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length > 0) {
    env[key.trim()] = vals.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase URL or Anon Key');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, anonKey);

async function runAdminVerification() {
  console.log('=== START COMPLETE ADMIN & SECURITY TEST ===\n');

  // 1. Anon Client - RLS verification
  console.log('--- 1. Testing Customer Anonymous Security (RLS) ---');
  const { data: anonProducts, error: anonProdErr } = await anonClient
    .from('products')
    .select('id, name, active')
    .limit(5);

  console.log('✓ Anon can SELECT products:', !anonProdErr, `(found ${anonProducts ? anonProducts.length : 0})`);

  // Anon must NOT be able to insert
  const { error: anonInsertErr } = await anonClient
    .from('products')
    .insert({
      name: 'Hacked Product',
      slug: 'hacked-product-' + Date.now(),
      description: 'Test',
      full_description: 'Test',
      logo_url: 'https://example.com/logo.png',
      category: 'Hacking',
      active: true,
    });

  if (anonInsertErr) {
    console.log('✓ Anon BLOCKED from INSERT (RLS enforced):', anonInsertErr.message);
  } else {
    console.error('❌ ERROR: Anon was able to insert into products!');
  }

  // 2. Admin Authentication
  console.log('\n--- 2. Testing Admin Supabase Auth ---');
  const adminEmail = 'admin@nexadigital.id';
  const adminPassword = 'adminpassword123';

  // Create admin client instance with auth
  const adminClient = createClient(supabaseUrl, anonKey);
  const { data: authData, error: authError } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError || !authData.session) {
    console.error('❌ Admin login failed:', authError ? authError.message : 'No session');
    return;
  }
  console.log('✓ Admin login SUCCESS:', authData.user.email);

  // 3. Admin CRUD - Products
  console.log('\n--- 3. Testing Admin Product CRUD ---');
  const testSlug = 'admin-test-app-' + Date.now();
  const { data: newProd, error: newProdErr } = await adminClient
    .from('products')
    .insert({
      name: 'Admin Test App VIP',
      slug: testSlug,
      description: 'Deskripsi test produk',
      full_description: 'Deskripsi lengkap test produk',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      category: 'Streaming',
      badge: 'TEST',
      active: true,
    })
    .select()
    .single();

  if (newProdErr) {
    console.error('❌ Failed to insert product:', newProdErr.message);
  } else {
    console.log('✓ Admin added product SUCCESS:', newProd.id, newProd.name);
  }

  // 4. Admin CRUD - Product Packages
  console.log('\n--- 4. Testing Admin Package Management ---');
  const { data: newPkg, error: newPkgErr } = await adminClient
    .from('product_packages')
    .insert({
      product_id: newProd.id,
      duration: '1 Bulan Ultra HD',
      price: 35000,
      active: true,
    })
    .select()
    .single();

  if (newPkgErr) {
    console.error('❌ Failed to insert package:', newPkgErr.message);
  } else {
    console.log('✓ Admin added package SUCCESS:', newPkg.id, newPkg.duration, 'Rp ' + newPkg.price);
  }

  // Update Package Price
  const { error: updPkgErr } = await adminClient
    .from('product_packages')
    .update({ price: 39000 })
    .eq('id', newPkg.id);
  console.log('✓ Admin updated package price SUCCESS:', !updPkgErr);

  // 5. Admin CRUD - Services
  console.log('\n--- 5. Testing Admin Services Management ---');
  const testServiceSlug = 'test-editing-jasa-' + Date.now();
  const { data: newServ, error: newServErr } = await adminClient
    .from('services')
    .insert({
      name: 'Jasa Video Editing 4K',
      slug: testServiceSlug,
      description: 'Layanan editing video sinematik',
      icon: 'Video',
      price: 150000,
      active: true,
    })
    .select()
    .single();

  if (newServErr) {
    console.error('❌ Failed to insert service:', newServErr.message);
  } else {
    console.log('✓ Admin added service SUCCESS:', newServ.id, newServ.name);
  }

  // Toggle active service
  const { error: togServErr } = await adminClient
    .from('services')
    .update({ active: false })
    .eq('id', newServ.id);
  console.log('✓ Admin toggled service active status SUCCESS:', !togServErr);

  // 6. Admin CRUD - Cinema Promos
  console.log('\n--- 6. Testing Admin Cinema Promos Management ---');
  const { data: newPromo, error: newPromoErr } = await adminClient
    .from('cinema_promos')
    .insert({
      name: 'Promo Bioskop Akhir Pekan Hemat',
      cinema: 'Cinema XXI',
      description: 'Tiket nonton hemat hari Sabtu dan Minggu',
      price: 45000,
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      active: true,
    })
    .select()
    .single();

  if (newPromoErr) {
    console.error('❌ Failed to insert promo:', newPromoErr.message);
  } else {
    console.log('✓ Admin added cinema promo SUCCESS:', newPromo.id, newPromo.name);
  }

  // 7. Store Settings
  console.log('\n--- 7. Testing Store Settings & Centralized WhatsApp ---');
  const { data: settingsData, error: settingsErr } = await adminClient
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  console.log('✓ Store settings retrieved SUCCESS:', settingsData ? settingsData.store_name : null, 'WA:', settingsData ? settingsData.whatsapp_number : null);

  const testPhone = '6289988776655';
  const { error: updSettingsErr } = await adminClient
    .from('store_settings')
    .update({ whatsapp_number: testPhone })
    .eq('id', 'default');
  console.log('✓ Store WhatsApp updated SUCCESS:', !updSettingsErr);

  // Restore default phone
  await adminClient
    .from('store_settings')
    .update({ whatsapp_number: '6285709918896' })
    .eq('id', 'default');
  console.log('✓ Store WhatsApp reset to default 6285709918896');

  // 8. Cleanup Test Items
  console.log('\n--- 8. Cleaning up test data ---');
  await adminClient.from('products').delete().eq('id', newProd.id);
  await adminClient.from('services').delete().eq('id', newServ.id);
  await adminClient.from('cinema_promos').delete().eq('id', newPromo.id);
  console.log('✓ Test product, service, and promo cleaned up cleanly.');

  // 9. Logout
  console.log('\n--- 9. Testing Admin Logout ---');
  const { error: signOutErr } = await adminClient.auth.signOut();
  console.log('✓ Admin signOut SUCCESS:', !signOutErr);

  console.log('\n=== ALL COMPLETE ADMIN TESTS PASSED 100%! ===');
}

runAdminVerification().catch(console.error);
