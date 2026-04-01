// Debug detalhado da API PUT
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAPIPUT() {
  console.log('🔍 DEBUG DETALHADO API PUT...\n');

  try {
    // 1. Ver dados atuais na tabela
    console.log('1. 📊 DADOS ATUAIS NA TABELA:');
    const { data: currentData, error: selectError } = await supabase
      .from('paginas_conteudo')
      .select('*')
      .eq('pagina', 'home');
      
    if (selectError) {
      console.error('❌ Erro SELECT:', selectError);
    } else {
      console.log('Registros encontrados:', currentData?.length || 0);
      if (currentData && currentData.length > 0) {
        console.log('Registro atual:', {
          id: currentData[0].id,
          titulo: currentData[0].titulo,
          updated_at: currentData[0].updated_at
        });
      }
    }

    // 2. Tentar UPSERT direto
    console.log('\n2. 🔧 TESTANDO UPSERT DIRETO:');
    const testContent = {
      pagina: 'home',
      titulo: `DEBUG TEST ${Date.now()}`,
      subtitulo: 'Debug subtitle',
      conteudo: { debug: true },
      updated_at: new Date().toISOString()
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('paginas_conteudo')
      .upsert(testContent, { onConflict: 'pagina' })
      .select();

    if (upsertError) {
      console.error('❌ Erro UPSERT:', upsertError);
    } else {
      console.log('✅ UPSERT sucesso:', upsertData?.length || 0, 'registros');
    }

    // 3. Verificar novamente
    console.log('\n3. 📊 DADOS APÓS UPSERT:');
    const { data: afterData, error: afterError } = await supabase
      .from('paginas_conteudo')
      .select('*')
      .eq('pagina', 'home');
      
    if (afterError) {
      console.error('❌ Erro SELECT after:', afterError);
    } else {
      if (afterData && afterData.length > 0) {
        console.log('Registro após UPSERT:', {
          id: afterData[0].id,
          titulo: afterData[0].titulo,
          updated_at: afterData[0].updated_at
        });
      }
    }

    // 4. Verificar se RLS está bloqueando
    console.log('\n4. 🛡️ TESTANDO RLS (Row Level Security):');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('paginas_conteudo')
      .insert({
        pagina: `test-rls-${Date.now()}`,
        titulo: 'RLS Test',
        subtitulo: '',
        conteudo: {}
      })
      .select();

    if (rlsError) {
      console.error('❌ RLS pode estar bloqueando:', rlsError.message);
    } else {
      console.log('✅ RLS OK, insert funcionou');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugAPIPUT();