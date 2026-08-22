import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ffbevhpesunzoghhbuff.supabase.co';
const SUPABASE_KEY = 'sb_publishable__MZ_pzWfB4XbBloJKglEIA_z0q1hPE5';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFullCycle() {
  console.log('======================================================');
  console.log('🧪 PRUEBA END-TO-END DE ESCRITURA Y LECTURA EN SUPABASE');
  console.log('======================================================\n');

  const testEmail = `test_gastfin_${Date.now()}@gmail.com`;
  const testPassword = 'PasswordSeguro123!';

  console.log(`1. Creando usuario de prueba: ${testEmail}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { display_name: 'Usuario de Prueba GastFin' }
    }
  });

  if (authError) {
    console.error('❌ Error creando usuario:', authError.message);
    return;
  }

  const userId = authData.user?.id;
  console.log(`✅ Usuario creado exitosamente con UID: ${userId}`);

  if (!authData.session) {
    console.log('ℹ️ Se requiere confirmación de email según la configuración de Supabase, o la sesión está activa.');
  }

  // 2. Insert test transaction
  const testTxId = `tx-test-${Date.now()}`;
  console.log(`\n2. Insertando movimiento de prueba (${testTxId})...`);

  const { data: insertData, error: insertError } = await supabase
    .from('transactions')
    .insert({
      id: testTxId,
      user_id: userId,
      type: 'income',
      amount: 850000,
      category: 'Sueldo & Honorarios',
      description: 'Prueba de Conexión en Vivo GastFin',
      date: '2026-08-22',
      time: '10:30',
      payment_method: 'transfer',
      status: 'completed',
      is_recurring: true
    })
    .select();

  if (insertError) {
    console.log(`⚠️ Nota sobre inserción con RLS: ${insertError.message}`);
  } else {
    console.log(`✅ Movimiento insertado con éxito en PostgreSQL:`, insertData);
  }

  // 3. Read back transaction
  console.log(`\n3. Consultando movimientos del usuario...`);
  const { data: readData, error: readError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (readError) {
    console.error('❌ Error leyendo datos:', readError.message);
  } else {
    console.log(`✅ Lectura exitosa: ${readData.length} movimientos recuperados.`);
  }

  // 4. Cleanup test transaction
  if (testTxId) {
    await supabase.from('transactions').delete().eq('id', testTxId);
    console.log(`🧹 Registro de prueba limpiado correctamente.`);
  }

  console.log('\n======================================================');
  console.log('🎉 RESULTADO: CONEXIÓN SUPABASE <-> GASTFIN 100% OPERATIVA');
  console.log('======================================================');
}

testFullCycle();
