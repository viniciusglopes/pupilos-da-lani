// Testar a API /modelos corrigida
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljttishwndzkcytkdsrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk';

async function testAPIModelos() {
  console.log('🧪 TESTANDO API MODELOS CORRIGIDA...\n');

  try {
    // Simular a chamada da API corrigida
    const response = await fetch('https://ljttishwndzkcytkdsrc.supabase.co/rest/v1/pessoas?select=*,fotos(*),videos(*)&ativo=eq.true&order=created_at.desc&limit=50&offset=0', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA'
      }
    });

    if (!response.ok) {
      console.error('❌ Erro na API:', response.status, response.statusText);
      return;
    }

    const modelos = await response.json();
    console.log(`✅ ${modelos.length} pupilos encontrados com fotos/vídeos:`);
    
    modelos.forEach(pupilo => {
      console.log(`\n👤 ${pupilo.nome}:`);
      console.log(`   - Ativo: ${pupilo.ativo}`);
      console.log(`   - Destaque: ${pupilo.destaque}`);
      console.log(`   - Fotos: ${pupilo.fotos?.length || 0}`);
      console.log(`   - Videos: ${pupilo.videos?.length || 0}`);
      
      if (pupilo.fotos?.length > 0) {
        pupilo.fotos.forEach((foto, idx) => {
          console.log(`     📷 Foto ${idx + 1}: ${foto.url_arquivo ? 'URL OK' : 'SEM URL'}`);
        });
      }
    });

    // Verificar quais têm fotos
    const comFotos = modelos.filter(p => p.fotos?.length > 0);
    const semFotos = modelos.filter(p => !p.fotos || p.fotos.length === 0);
    
    console.log(`\n📊 RESUMO:`);
    console.log(`✅ Com fotos: ${comFotos.length}`);
    console.log(`❌ Sem fotos: ${semFotos.length}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testAPIModelos();