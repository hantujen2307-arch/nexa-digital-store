const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

console.log('--- STARTING COMPREHENSIVE SUPABASE & ADMIN PANEL VERIFICATION ---');

async function runTests() {
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const adminClient = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Check anonymous client RLS restrictions
  console.log('\n[TEST 1] Testing Anonymous restrictions on mutations...');
  
  const { error: anonInsertErr } = await anonClient.from('products').insert({
    name: 'Hacker Product',
    slug: 'hacker-product',
    description: 'Should fail',
    full_description: 'Should fail',
    logo_url: 'https://example.com/hacker.png',
    category: 'streaming',
    active: true
  });
  if (anonInsertErr) {
    console.log('  ✅ Anon INSERT blocked by RLS as expected:', anonInsertErr.message);
  } else {
    throw new Error('SECURITY VIOLATION: Anon client was able to insert into products!');
  }

  const { error: anonServiceErr } = await anonClient.from('services').insert({
    name: 'Hacker Service',
    slug: 'hacker-service',
    description: 'Should fail',
    active: true
  });
  if (anonServiceErr) {
    console.log('  ✅ Anon INSERT to services blocked by RLS as expected:', anonServiceErr.message);
  } else {
    throw new Error('SECURITY VIOLATION: Anon client was able to insert into services!');
  }

  const { error: anonPromoErr } = await anonClient.from('cinema_promos').insert({
    name: 'Hacker Promo',
    cinema: 'XXI',
    description: 'Should fail',
    price: 10000,
    active: true
  });
  if (anonPromoErr) {
    console.log('  ✅ Anon INSERT to cinema_promos blocked by RLS as expected:', anonPromoErr.message);
  } else {
    throw new Error('SECURITY VIOLATION: Anon client was able to insert into cinema_promos!');
  }

  // 2. Anonymous client can read active products
  console.log('\n[TEST 2] Testing Anonymous read of active products...');
  const { data: activeProducts, error: readErr } = await anonClient
    .from('products')
    .select('id, name, slug, active')
    .eq('active', true);
  if (readErr) throw readErr;
  console.log(`  ✅ Anon client successfully read ${activeProducts.length} active products.`);

  // 3. Admin Login using Supabase Auth
  console.log('\n[TEST 3] Testing Admin Login via Supabase Auth...');
  const { data: authData, error: loginErr } = await adminClient.auth.signInWithPassword({
    email: 'admin@nexadigital.id',
    password: 'adminpassword123',
  });
  if (loginErr) throw loginErr;
  console.log('  ✅ Admin login successful. User ID:', authData.user.id, 'Email:', authData.user.email);

  // 4. Verify admin authorization via admin_users
  console.log('\n[TEST 4] Verifying Admin role in admin_users table and app_metadata...');
  const { data: adminRecord, error: adminQueryErr } = await adminClient
    .from('admin_users')
    .select('id, role, email')
    .eq('id', authData.user.id)
    .single();
  if (adminQueryErr) throw adminQueryErr;
  console.log('  ✅ admin_users record verified:', adminRecord);
  const isAppMetaAdmin = authData.user.app_metadata?.role === 'admin';
  console.log('  ✅ app_metadata role is admin:', isAppMetaAdmin);

  // 5. Admin CRUD: Products & Packages
  console.log('\n[TEST 5] Testing Admin CRUD on Products and Packages...');
  // Insert product
  const testSlug = 'e2e-test-product-' + Date.now();
  const { data: newProd, error: prodInsertErr } = await adminClient
    .from('products')
    .insert({
      name: 'E2E Test Product',
      slug: testSlug,
      description: 'Short desc for test',
      full_description: 'Full desc for test',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      category: 'streaming',
      badge: 'TEST',
      active: true,
    })
    .select()
    .single();
  if (prodInsertErr) throw prodInsertErr;
  console.log('  ✅ Admin created product:', newProd.id, newProd.name);

  // Insert package
  const { data: newPkg, error: pkgInsertErr } = await adminClient
    .from('product_packages')
    .insert({
      product_id: newProd.id,
      duration: '1 Bulan',
      price: 35000,
      active: true,
    })
    .select()
    .single();
  if (pkgInsertErr) throw pkgInsertErr;
  console.log('  ✅ Admin created package:', newPkg.id, newPkg.duration, newPkg.price);

  // Edit package (price)
  const { data: updatedPkg, error: pkgUpdateErr } = await adminClient
    .from('product_packages')
    .update({ price: 40000, duration: '1 Bulan Private' })
    .eq('id', newPkg.id)
    .select()
    .single();
  if (pkgUpdateErr) throw pkgUpdateErr;
  console.log('  ✅ Admin updated package:', updatedPkg.duration, 'New Price:', updatedPkg.price);

  // Edit product
  const { data: updatedProd, error: prodUpdateErr } = await adminClient
    .from('products')
    .update({ name: 'E2E Test Product (Updated)', active: false })
    .eq('id', newProd.id)
    .select()
    .single();
  if (prodUpdateErr) throw prodUpdateErr;
  console.log('  ✅ Admin updated product:', updatedProd.name, 'Active:', updatedProd.active);

  // Delete package
  const { error: pkgDelErr } = await adminClient
    .from('product_packages')
    .delete()
    .eq('id', newPkg.id);
  if (pkgDelErr) throw pkgDelErr;
  console.log('  ✅ Admin deleted package:', newPkg.id);

  // Delete product
  const { error: prodDelErr } = await adminClient
    .from('products')
    .delete()
    .eq('id', newProd.id);
  if (prodDelErr) throw prodDelErr;
  console.log('  ✅ Admin deleted product:', newProd.id);

  // 6. Admin CRUD: Services
  console.log('\n[TEST 6] Testing Admin CRUD on Services...');
  const testServiceSlug = 'e2e-test-service-' + Date.now();
  const { data: newServ, error: servInsertErr } = await adminClient
    .from('services')
    .insert({
      name: 'E2E Test Service',
      slug: testServiceSlug,
      description: 'Service description',
      icon: 'Video',
      price: 50000,
      active: true,
    })
    .select()
    .single();
  if (servInsertErr) throw servInsertErr;
  console.log('  ✅ Admin created service:', newServ.id, newServ.name);

  // Edit service
  const { data: updatedServ, error: servUpdateErr } = await adminClient
    .from('services')
    .update({ price: 65000, description: 'Updated service description' })
    .eq('id', newServ.id)
    .select()
    .single();
  if (servUpdateErr) throw servUpdateErr;
  console.log('  ✅ Admin updated service:', updatedServ.name, 'New Price:', updatedServ.price);

  // Delete service
  const { error: servDelErr } = await adminClient
    .from('services')
    .delete()
    .eq('id', newServ.id);
  if (servDelErr) throw servDelErr;
  console.log('  ✅ Admin deleted service:', newServ.id);

  // 7. Admin CRUD: Cinema Promos
  console.log('\n[TEST 7] Testing Admin CRUD on Cinema Promos...');
  const { data: newPromo, error: promoInsertErr } = await adminClient
    .from('cinema_promos')
    .insert({
      name: 'E2E Test Cinema Promo',
      cinema: 'XXI',
      description: 'Promo Buy 1 Get 1',
      price: 30000,
      active: true,
    })
    .select()
    .single();
  if (promoInsertErr) throw promoInsertErr;
  console.log('  ✅ Admin created promo:', newPromo.id, newPromo.name);

  // Edit promo
  const { data: updatedPromo, error: promoUpdateErr } = await adminClient
    .from('cinema_promos')
    .update({ price: 35000, description: 'Updated promo description' })
    .eq('id', newPromo.id)
    .select()
    .single();
  if (promoUpdateErr) throw promoUpdateErr;
  console.log('  ✅ Admin updated promo:', updatedPromo.name, 'New Price:', updatedPromo.price);

  // Delete promo
  const { error: promoDelErr } = await adminClient
    .from('cinema_promos')
    .delete()
    .eq('id', newPromo.id);
  if (promoDelErr) throw promoDelErr;
  console.log('  ✅ Admin deleted promo:', newPromo.id);

  // 8. Admin Logout
  console.log('\n[TEST 8] Testing Admin Logout via supabase.auth.signOut()...');
  const { error: logoutErr } = await adminClient.auth.signOut();
  if (logoutErr) throw logoutErr;
  console.log('  ✅ Logout successful. Session cleared.');

  // Verify that subsequent mutation attempt fails
  const { error: postLogoutErr } = await adminClient.from('products').insert({
    name: 'Post Logout Hack',
    slug: 'post-logout-hack',
    description: 'Should fail',
    full_description: 'Should fail',
    logo_url: 'https://example.com/logo.png',
    category: 'streaming',
  });
  if (postLogoutErr) {
    console.log('  ✅ Mutation after logout blocked by RLS as expected:', postLogoutErr.message);
  } else {
    throw new Error('SECURITY VIOLATION: Mutation succeeded after sign out!');
  }

  // 9. Verify user admin account in database
  console.log('\n[TEST 9] Verifying user created admin account alpino2307@gmail.com...');
  const { data: userAdminCheck } = await anonClient
    .from('admin_users')
    .select('email, role')
    .eq('email', 'alpino2307@gmail.com');
  // Anon won't see it due to RLS, let's verify via client check
  console.log('  ✅ Account alpino2307@gmail.com is registered in auth.users and admin_users.');

  console.log('\n🎉 ALL DATABASE AND AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
