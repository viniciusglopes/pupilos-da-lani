// Adicionar campo idade na tabela pessoas
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addIdadeField() {
  console.log('🔧 ADICIONANDO CAMPO IDADE...\n');

  try {
    // Não podemos adicionar coluna via supabase-js, vamos só atualizar idades
    console.log('📝 Atualizando idades dos pupilos existentes...');
    
    const updates = [
      { nome: 'Nicole Lopes', idade: 8 },
      { nome: 'João Lucas Bueno Lopes', idade: 12 },
      { nome: 'Vinicius Guimarães Lopes', idade: 35 }
    ];

    for (const update of updates) {
      const { data, error } = await supabase
        .from('pessoas')
        .update({ idade: update.idade })
        .eq('nome', update.nome)
        .select('nome, idade');
        
      if (error) {
        console.error(`❌ Erro atualizando ${update.nome}:`, error.message);
      } else {
        console.log(`✅ ${update.nome}: ${update.idade} anos`);
      }
    }

    // Verificar resultado
    console.log('\n📊 VERIFICANDO IDADES:');
    const { data: pessoas, error: selectError } = await supabase
      .from('pessoas')
      .select('nome, idade')
      .not('idade', 'is', null);
      
    if (selectError) {
      console.error('❌ Erro verificando:', selectError);
    } else {
      console.log('Pessoas com idade definida:', pessoas?.length || 0);
      pessoas?.forEach(p => console.log(`- ${p.nome}: ${p.idade} anos`));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

addIdadeField();