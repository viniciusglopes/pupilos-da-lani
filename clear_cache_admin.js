// Limpar cache local admin CMS
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗑️ LIMPANDO CACHE ADMIN CMS...\n');

// Limpar arquivos cache locais
const cacheDir = '/tmp/paginas-data';

try {
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir);
    files.forEach(file => {
      const filePath = path.join(cacheDir, file);
      fs.unlinkSync(filePath);
      console.log(`✅ Removido: ${file}`);
    });
    console.log(`🗑️ Limpou ${files.length} arquivos cache`);
  } else {
    console.log('📁 Diretório cache não existe (ok)');
  }
} catch (error) {
  console.log('⚠️ Erro limpando cache:', error.message);
}

// Testar se API funciona após limpeza
console.log('\n🧪 TESTANDO API APÓS LIMPEZA...');

async function testAPI() {
  try {
    // Salvar dados em branco
    const putResponse = await fetch('https://pupiloslani.com.br/api/paginas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagina: 'home',
        titulo: '',
        subtitulo: '',
        conteudo: {
          btn_talentos: '',
          btn_modelo: '',
          destaques_label: '',
          destaques_titulo: ''
        }
      })
    });
    
    const putData = await putResponse.json();
    console.log('PUT resultado:', putData.success ? '✅' : '❌');
    
    // Ler dados
    const getResponse = await fetch('https://pupiloslani.com.br/api/paginas?pagina=home');
    const getData = await getResponse.json();
    
    console.log('GET resultado:', {
      titulo: getData.conteudo?.titulo || '(vazio)',
      updated_at: getData.conteudo?.updated_at
    });
    
    if (getData.conteudo?.titulo === '') {
      console.log('✅ ADMIN CMS FUNCIONANDO - campos em branco salvaram!');
    } else {
      console.log('❌ ADMIN CMS ainda com problema - retornando dados antigos');
    }
    
  } catch (error) {
    console.error('❌ Erro testando API:', error.message);
  }
}

testAPI();