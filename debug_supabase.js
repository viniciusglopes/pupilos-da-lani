// Debug e fix do Supabase
const { createClient } = require('@supabase/supabase-js');

// Credenciais do .env.production
const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSupabase() {
  console.log('🔍 DIAGNÓSTICO SUPABASE...\n');

  try {
    // 1. Verificar pessoas e fotos
    console.log('1. 📊 VERIFICANDO DADOS DOS PUPILOS:');
    const { data: pessoas, error: pessoasError } = await supabase
      .from('pessoas')
      .select(`
        id, 
        nome, 
        ativo,
        destaque,
        fotos:fotos(count)
      `);
      
    if (pessoasError) {
      console.error('❌ Erro ao buscar pessoas:', pessoasError);
    } else {
      console.log(`✅ ${pessoas?.length || 0} pupilos encontrados`);
      pessoas?.forEach(p => {
        const fotosCount = Array.isArray(p.fotos) ? p.fotos.length : (p.fotos?.count || 0);
        console.log(`   - ${p.nome}: ${fotosCount} fotos (ativo: ${p.ativo}, destaque: ${p.destaque})`);
      });
    }

    // 2. Verificar fotos direto
    console.log('\n2. 📷 VERIFICANDO FOTOS DIRETO:');
    const { data: fotos, error: fotosError } = await supabase
      .from('fotos')
      .select('id, pessoa_id, url_foto');
      
    if (fotosError) {
      console.error('❌ Erro ao buscar fotos:', fotosError);
    } else {
      console.log(`✅ ${fotos?.length || 0} fotos no sistema total`);
    }

    // 3. Verificar tabela analytics
    console.log('\n3. 📈 VERIFICANDO TABELA ANALYTICS:');
    const { data: analytics, error: analyticsError } = await supabase
      .from('site_analytics')
      .select('*')
      .limit(1);
      
    if (analyticsError) {
      console.error('❌ Erro na tabela analytics:', analyticsError.message);
      console.log('   🔧 Precisa criar/corrigir tabela analytics');
    } else {
      console.log('✅ Tabela analytics OK');
    }

    // 4. Testar insert analytics
    console.log('\n4. 🧪 TESTANDO INSERT ANALYTICS:');
    const { data: testInsert, error: insertError } = await supabase
      .from('site_analytics')
      .insert({
        visit_date: new Date().toISOString().split('T')[0],
        page_path: '/debug-test',
        user_ip: 'debug-ip',
        user_agent: 'debug-agent',
        visit_count: 1
      });
      
    if (insertError) {
      console.error('❌ Erro no insert analytics:', insertError.message);
    } else {
      console.log('✅ Insert analytics funcionando');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugSupabase();