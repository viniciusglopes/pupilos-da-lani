// Testar PUT API do Admin
async function testAdminPUT() {
  console.log('🧪 TESTANDO PUT API ADMIN...\n');

  try {
    // 1. GET atual
    console.log('1. 📖 CONTEÚDO ATUAL:');
    const getRes = await fetch('https://pupiloslani.com.br/api/paginas?pagina=home');
    const getCurrent = await getRes.json();
    console.log('Título atual:', getCurrent.conteudo?.titulo);

    // 2. PUT com dados de teste
    console.log('\n2. 💾 ENVIANDO PUT:');
    const testData = {
      pagina: 'home',
      titulo: `TESTE ADMIN ${Date.now()}`,
      subtitulo: 'Testando salvamento admin',
      conteudo: {
        btn_talentos: 'Talentos Testados',
        btn_modelo: 'Seja Modelo Testado'
      }
    };

    const putRes = await fetch('https://pupiloslani.com.br/api/paginas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const putData = await putRes.json();
    console.log('PUT Response:', putRes.status, putData.success ? '✅' : '❌');
    
    if (!putData.success) {
      console.error('PUT Error:', putData.error);
    }

    // 3. GET após PUT para verificar se salvou
    console.log('\n3. 📖 CONTEÚDO APÓS PUT:');
    const getRes2 = await fetch('https://pupiloslani.com.br/api/paginas?pagina=home');
    const getAfterPut = await getRes2.json();
    console.log('Novo título:', getAfterPut.conteudo?.titulo);

    // 4. Comparar
    if (getCurrent.conteudo?.titulo !== getAfterPut.conteudo?.titulo) {
      console.log('✅ PUT funcionou! Título foi alterado.');
    } else {
      console.log('❌ PUT não persistiu! Título não mudou.');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAdminPUT();