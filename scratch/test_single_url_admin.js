const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const http = require('http');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

function getHttp(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
      });
    }).on('error', reject);
  });
}

async function runSingleUrlVerification() {
  console.log('========================================================');
  console.log('   VERIFIKASI SISTEM SINGLE URL WEBSITE & ADMIN PANEL   ');
  console.log('========================================================\n');

  // 1. Customer Experience Tests
  console.log('[TEST 1] Verifikasi Akses Customer (Tanpa Login)...');
  const homeRes = await getHttp('/');
  console.log(`  ✓ GET / -> Status: ${homeRes.statusCode} (Publik & Tanpa Login)`);
  if (homeRes.statusCode !== 200) throw new Error('Homepage tidak merespons 200 OK');

  const prodRes = await getHttp('/produk/netflix-premium');
  console.log(`  ✓ GET /produk/netflix-premium -> Status: ${prodRes.statusCode} (Publik & Tanpa Login)`);
  if (prodRes.statusCode !== 200) throw new Error('Halaman produk tidak merespons 200 OK');

  // 2. Redirect Legacy Admin URLs to Single URL
  console.log('\n[TEST 2] Verifikasi Redirect URL Lama ke Single URL (/?admin=open)...');
  const adminRes = await getHttp('/admin');
  console.log(`  ✓ GET /admin -> Status: ${adminRes.statusCode}, Location: ${adminRes.headers.location}`);
  if (adminRes.headers.location !== '/?admin=open') throw new Error('Legacy /admin tidak redirect ke /?admin=open');

  const loginRes = await getHttp('/admin/login');
  console.log(`  ✓ GET /admin/login -> Status: ${loginRes.statusCode}, Location: ${loginRes.headers.location}`);
  if (loginRes.headers.location !== '/?admin=open') throw new Error('Legacy /admin/login tidak redirect ke /?admin=open');

  // 3. RLS Security Tests
  console.log('\n[TEST 3] Verifikasi Keamanan Database (RLS Protection)...');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  // Anon tries to insert product
  const { error: anonInsertErr } = await anonClient.from('products').insert({
    name: 'Hack Attempt',
    slug: 'hack-attempt',
    description: 'Should fail',
    active: true,
  });
  if (anonInsertErr) {
    console.log('  ✓ Anonymous INSERT ditolak oleh RLS:', anonInsertErr.message);
  } else {
    throw new Error('SECURITY BREACH: Anonymous berhasil INSERT ke products!');
  }

  // 4. Admin Auth & CRUD via Supabase
  console.log('\n[TEST 4] Verifikasi Login Admin Supabase Auth & Role-Based Access...');
  const adminClient = createClient(supabaseUrl, supabaseAnonKey);

  const { data: authData, error: authErr } = await adminClient.auth.signInWithPassword({
    email: 'admin@nexadigital.id',
    password: 'adminpassword123',
  });
  if (authErr) throw authErr;
  console.log(`  ✓ Login berhasil sebagai: ${authData.user.email} (ID: ${authData.user.id})`);

  // Verify admin table role
  const { data: adminRecord, error: adminTableErr } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('id', authData.user.id)
    .single();
  if (adminTableErr) throw adminTableErr;
  console.log(`  ✓ Status role admin di database terverifikasi: role = '${adminRecord.role}'`);

  // 5. Admin CRUD: Product & Packages
  console.log('\n[TEST 5] Verifikasi CRUD Produk & Manajemen Paket Harga...');
  const testSlug = 'single-url-test-' + Date.now();
  const { data: newProd, error: insertProdErr } = await adminClient
    .from('products')
    .insert({
      name: 'Single URL Test Product',
      slug: testSlug,
      description: 'Deskripsi uji coba single url',
      full_description: 'Deskripsi lengkap uji coba',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      category: 'streaming',
      active: true,
    })
    .select()
    .single();
  if (insertProdErr) throw insertProdErr;
  console.log(`  ✓ Admin berhasil menambah produk: "${newProd.name}" (${newProd.id})`);

  // Add package with price
  const { data: newPkg, error: insertPkgErr } = await adminClient
    .from('product_packages')
    .insert({
      product_id: newProd.id,
      duration: '1 Bulan',
      price: 25000,
      active: true,
    })
    .select()
    .single();
  if (insertPkgErr) throw insertPkgErr;
  console.log(`  ✓ Admin berhasil menambah paket: ${newPkg.duration} - Rp ${newPkg.price.toLocaleString('id-ID')}`);

  // Update package price
  const { data: updatedPkg, error: updatePkgErr } = await adminClient
    .from('product_packages')
    .update({ price: 30000, duration: '1 Bulan Private' })
    .eq('id', newPkg.id)
    .select()
    .single();
  if (updatePkgErr) throw updatePkgErr;
  console.log(`  ✓ Admin berhasil mengubah harga paket: ${updatedPkg.duration} -> Rp ${updatedPkg.price.toLocaleString('id-ID')}`);

  // Delete package
  const { error: delPkgErr } = await adminClient
    .from('product_packages')
    .delete()
    .eq('id', newPkg.id);
  if (delPkgErr) throw delPkgErr;
  console.log(`  ✓ Admin berhasil menghapus paket (${newPkg.id})`);

  // Delete product
  const { error: delProdErr } = await adminClient
    .from('products')
    .delete()
    .eq('id', newProd.id);
  if (delProdErr) throw delProdErr;
  console.log(`  ✓ Admin berhasil menghapus produk (${newProd.id})`);

  // 6. Admin CRUD: Services
  console.log('\n[TEST 6] Verifikasi CRUD Jasa Editing...');
  const testServiceSlug = 'single-url-service-' + Date.now();
  const { data: newServ, error: insertServErr } = await adminClient
    .from('services')
    .insert({
      name: 'Single URL Test Service',
      slug: testServiceSlug,
      description: 'Jasa editing uji coba',
      icon: 'Video',
      price: 75000,
      active: true,
    })
    .select()
    .single();
  if (insertServErr) throw insertServErr;
  console.log(`  ✓ Admin berhasil menambah jasa: "${newServ.name}" (${newServ.id})`);

  // Delete service
  const { error: delServErr } = await adminClient
    .from('services')
    .delete()
    .eq('id', newServ.id);
  if (delServErr) throw delServErr;
  console.log(`  ✓ Admin berhasil menghapus jasa (${newServ.id})`);

  // 7. Admin CRUD: Cinema Promos
  console.log('\n[TEST 7] Verifikasi CRUD Promo Bioskop...');
  const { data: newPromo, error: insertPromoErr } = await adminClient
    .from('cinema_promos')
    .insert({
      name: 'Single URL Test Cinema Promo',
      cinema: 'Cinema XXI',
      description: 'Promo uji coba',
      price: 35000,
      active: true,
    })
    .select()
    .single();
  if (insertPromoErr) throw insertPromoErr;
  console.log(`  ✓ Admin berhasil menambah promo: "${newPromo.name}" (${newPromo.id})`);

  // Delete promo
  const { error: delPromoErr } = await adminClient
    .from('cinema_promos')
    .delete()
    .eq('id', newPromo.id);
  if (delPromoErr) throw delPromoErr;
  console.log(`  ✓ Admin berhasil menghapus promo (${newPromo.id})`);

  // 8. Admin Logout
  console.log('\n[TEST 8] Verifikasi Logout Admin...');
  const { error: logoutErr } = await adminClient.auth.signOut();
  if (logoutErr) throw logoutErr;
  console.log('  ✓ Logout Supabase Auth berhasil (Session dibersihkan).');

  console.log('\n========================================================');
  console.log('   🎉 SEMUA PENGUJIAN SINGLE URL & KEAMANAN BERHASIL! 🎉   ');
  console.log('========================================================\n');
}

runSingleUrlVerification().catch((err) => {
  console.error('\n❌ PENGUJIAN GAGAL:', err);
  process.exit(1);
});
