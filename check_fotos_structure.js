// Verificar estrutura real da tabela fotos
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFotosStructure() {
  console.log('🔍 VERIFICANDO ESTRUTURA TABELA FOTOS...\n');

  try {
    // Tentar diferentes nomes de colunas para fotos
    const possibleColumns = ['url', 'foto_url', 'image_url', 'caminho', 'path'];
    
    for (const col of possibleColumns) {
      try {
        const { data, error } = await supabase
          .from('fotos')
          .select(`id, pessoa_id, ${col}`)
          .limit(1);
          
        if (!error && data) {
          console.log(`✅ COLUNA CORRETA: "${col}"`);
          console.log('📄 Estrutura da tabela fotos:', data[0]);
          
          // Agora buscar todas as fotos com a coluna correta
          const { data: allFotos, error: allError } = await supabase
            .from('fotos')
            .select(`id, pessoa_id, ${col}`);
            
          if (!allError) {
            console.log(`📊 TOTAL FOTOS: ${allFotos?.length || 0}`);
            allFotos?.forEach(foto => {
              console.log(`   - Pessoa ${foto.pessoa_id}: ${foto[col]}`);
            });
          }
          return col; // Retorna a coluna correta
        }
      } catch (e) {
        // Continue testando
      }
    }
    
    // Se chegou aqui, vamos ver todas as colunas
    console.log('❌ Nenhuma coluna padrão encontrada. Verificando estrutura completa...');
    
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Erro ao verificar estrutura:', error);
    } else if (data && data.length > 0) {
      console.log('📋 COLUNAS DISPONÍVEIS:', Object.keys(data[0]));
    } else {
      console.log('⚠️  Tabela fotos existe mas está vazia');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkFotosStructure();