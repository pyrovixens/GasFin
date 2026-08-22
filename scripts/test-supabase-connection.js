import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ffbevhpesunzoghhbuff.supabase.co';
const SUPABASE_KEY = 'sb_publishable__MZ_pzWfB4XbBloJKglEIA_z0q1hPE5';

console.log('====================================================');
console.log('🔍 INICIANDO TEST DE CONEXIÓN GASTFIN <-> SUPABASE');
console.log('====================================================\n');
console.log(`🌐 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_KEY.substring(0, 20)}...`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runDiagnostics() {
  const results = {
    authService: false,
    databaseConnection: false,
    tables: {}
  };

  // 1. Test Auth Ping
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const pingTime = Date.now() - startTime;
    if (!error) {
      console.log(`✅ [AUTH]: Servicio de autenticación respondiendo OK (${pingTime}ms)`);
      results.authService = true;
    } else {
      console.log(`⚠️ [AUTH]: Advertencia en Auth: ${error.message}`);
    }
  } catch (err) {
    console.error(`❌ [AUTH]: Error conectando a Auth:`, err.message);
  }

  // 2. Test Tables in Database
  const tablesToTest = ['profiles', 'transactions', 'debts', 'goals', 'budgets'];

  console.log('\n📊 Comprobando estado de las tablas en PostgreSQL...');

  for (const table of tablesToTest) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          console.log(`❌ [TABLA '${table}']: No encontrada en PostgreSQL (Requiere ejecutar el script schema.sql)`);
          results.tables[table] = 'MISSING_TABLE';
        } else if (error.code === 'PGRST301' || error.message.includes('JWT') || error.code === '42501') {
          // Table exists and RLS blocked unauthenticated access (NORMAL & SECURE)
          console.log(`🔒 [TABLA '${table}']: Existe y protegida por RLS (Row Level Security activa y segura)`);
          results.tables[table] = 'EXISTS_RLS_ACTIVE';
        } else {
          console.log(`⚠️ [TABLA '${table}']: ${error.message} (Código: ${error.code})`);
          results.tables[table] = error.message;
        }
      } else {
        console.log(`✅ [TABLA '${table}']: Conectada y accesible (Conteo actual: ${count !== null ? count : 0})`);
        results.tables[table] = 'ACCESSIBLE';
      }
    } catch (tableErr) {
      console.error(`❌ [TABLA '${table}']: Error:`, tableErr.message);
      results.tables[table] = 'ERROR';
    }
  }

  console.log('\n====================================================');
  console.log('📋 RESUMEN DEL DIAGNÓSTICO');
  console.log('====================================================');
  console.log(JSON.stringify(results, null, 2));
}

runDiagnostics();
