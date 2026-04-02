// Debug script para verificar dados de fotos
const ID_EXEMPLO = '8be28908-30d6-4b0e-bb24-c0d0d0cceb70';

async function debugFotos() {
  console.log('🔍 DEBUG: Verificando dados de fotos...');
  
  try {
    // Testar API de modelos
    console.log('\n📋 Testando API /api/modelos...');
    const resModelos = await fetch('https://pupiloslani.com.br/api/modelos');
    const dataModelos = await resModelos.json();
    console.log('Modelos encontrados:', dataModelos.modelos?.length || 0);
    
    if (dataModelos.modelos?.[0]) {
      const primeiro = dataModelos.modelos[0];
      console.log('Primeiro modelo:', {
        id: primeiro.id,
        nome: primeiro.nome,
        fotos: primeiro.fotos?.length || 0,
        videos: primeiro.videos?.length || 0
      });
      
      if (primeiro.fotos?.[0]) {
        console.log('Primeira foto URL:', primeiro.fotos[0].url_arquivo);
      }
    }
    
    // Testar query Supabase direta
    console.log('\n🗄️ Testando Supabase direto...');
    const resSupa = await fetch(`https://ljttishwndzkcytkdsrc.supabase.co/rest/v1/pessoas?select=*,fotos(*),videos(*)&id=eq.${ID_EXEMPLO}`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA'
      }
    });
    
    const dataSupa = await resSupa.json();
    console.log('Resultado Supabase:', {
      encontrado: dataSupa?.[0] ? 'SIM' : 'NÃO',
      fotos: dataSupa?.[0]?.fotos?.length || 0,
      videos: dataSupa?.[0]?.videos?.length || 0
    });
    
    if (dataSupa?.[0]?.fotos?.[0]) {
      console.log('URL primeira foto:', dataSupa[0].fotos[0].url_arquivo);
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugFotos();