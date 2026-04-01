// Testar API do Admin - CMS páginas
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAPI() {
  console.log('🧪 TESTANDO API ADMIN CMS...\n');

  try {
    // 1. Verificar se tabela paginas_conteudo existe
    console.log('1. 📋 VERIFICANDO TABELA paginas_conteudo:');
    const { data: tableData, error: tableError } = await supabase
      .from('paginas_conteudo')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('❌ Erro na tabela paginas_conteudo:', tableError.message);
      console.log('🔧 Tabela precisa ser criada!');
    } else {
      console.log('✅ Tabela paginas_conteudo existe');
      console.log(`📊 Registros: ${tableData?.length || 0}`);
    }

    // 2. Testar INSERT/UPSERT na tabela
    console.log('\n2. 🧪 TESTANDO UPSERT:');
    const testContent = {
      pagina: 'test-admin',
      titulo: 'Teste Admin',
      subtitulo: 'Testando salvamento',
      conteudo: { teste: 'funcionando' },
      updated_at: new Date().toISOString()
    };
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('paginas_conteudo')
      .upsert(testContent, { onConflict: 'pagina' })
      .select()
      .single();
      
    if (upsertError) {
      console.error('❌ Erro no UPSERT:', upsertError.message);
      console.error('Detalhes:', upsertError);
    } else {
      console.log('✅ UPSERT funcionou!');
      console.log('Dados salvos:', upsertData);
    }

    // 3. Testar API direta via fetch
    console.log('\n3. 🌐 TESTANDO API /api/paginas:');
    try {
      const apiResponse = await fetch('https://pupiloslani.com.br/api/paginas?pagina=home');
      const apiData = await apiResponse.json();
      
      if (apiResponse.ok) {
        console.log('✅ API GET funcionando');
        console.log('Dados retornados:', Object.keys(apiData));
      } else {
        console.error('❌ API GET error:', apiResponse.status, apiData);
      }
    } catch (apiError) {
      console.error('❌ Erro ao chamar API:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAdminAPI();