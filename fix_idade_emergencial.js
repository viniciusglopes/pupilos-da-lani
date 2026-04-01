// Fix emergencial - adicionar idades diretamente
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixIdadeEmergencial() {
  console.log('🚨 FIX EMERGENCIAL - IDADES...\n');

  try {
    // Método 1: Tentar adicionar coluna via RPC/SQL (pode não funcionar)
    console.log('1. 🔧 Tentando adicionar coluna idade...');
    
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS idade INTEGER;'
    });
    
    if (sqlError) {
      console.log('⚠️ RPC não disponível ou coluna já existe:', sqlError.message);
    } else {
      console.log('✅ Coluna adicionada ou já existia');
    }

    // Método 2: Atualizar registros existentes (forçar idade)
    console.log('\n2. 📝 Atualizando idades nos registros...');
    
    const updates = [
      { nome: 'Nicole Lopes', idade: 8 },
      { nome: 'João Lucas Bueno Lopes', idade: 12 },
      { nome: 'Vinicius Guimarães Lopes', idade: 35 }
    ];

    for (const update of updates) {
      // Buscar o registro primeiro
      const { data: pessoas, error: searchError } = await supabase
        .from('pessoas')
        .select('id, nome')
        .ilike('nome', `%${update.nome}%`)
        .limit(1);
        
      if (searchError) {
        console.error(`❌ Erro buscando ${update.nome}:`, searchError.message);
        continue;
      }
      
      if (pessoas && pessoas.length > 0) {
        // Tentar atualizar com idade
        const { data, error } = await supabase
          .from('pessoas')
          .update({ idade: update.idade })
          .eq('id', pessoas[0].id)
          .select('nome, idade');
          
        if (error) {
          console.log(`⚠️ Coluna idade não existe ainda para ${update.nome}:`, error.message);
        } else {
          console.log(`✅ ${update.nome}: ${update.idade} anos`);
        }
      } else {
        console.log(`❓ Pessoa não encontrada: ${update.nome}`);
      }
    }

    console.log('\n3. 📊 Verificando resultado...');
    const { data: resultado, error: resultError } = await supabase
      .from('pessoas')
      .select('nome, idade')
      .not('idade', 'is', null);
      
    if (resultError) {
      console.log('⚠️ Ainda não é possível consultar idade:', resultError.message);
      console.log('Campo idade será adicionado manualmente no Supabase admin');
    } else {
      console.log('✅ Pessoas com idade definida:', resultado?.length || 0);
      resultado?.forEach(p => console.log(`- ${p.nome}: ${p.idade} anos`));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n🎯 PRÓXIMO PASSO: Execute no Supabase SQL Editor:');
  console.log('ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS idade INTEGER;');
  console.log('UPDATE pessoas SET idade = 8 WHERE nome = \'Nicole Lopes\';');
  console.log('UPDATE pessoas SET idade = 12 WHERE nome LIKE \'%João Lucas%\';');
  console.log('UPDATE pessoas SET idade = 35 WHERE nome LIKE \'%Vinicius%\';');
}

fixIdadeEmergencial();