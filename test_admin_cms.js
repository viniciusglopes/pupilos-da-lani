#!/usr/bin/env node

// TESTE DIRETO: Admin CMS - Simular salvamento exato
// Reproduzir o problema para identificar onde falha

const https = require('https');

const data = {
  pagina: 'home',
  titulo: 'TESTE BILLY ADMIN CMS 01h38',
  subtitulo: 'Teste definitivo para resolver problema persistente',
  conteudo: {
    btn_talentos: 'Ver Talentos',
    btn_modelo: 'Seja Pupilo',
    destaques_label: 'Destaques',
    destaques_titulo: 'Pupilos em Evidência',
    catalogo_label: 'Nosso Catálogo TESTE',
    cta_titulo: 'Quer fazer parte?',
    cta_texto: 'Cadastre-se como pupilo e conecte-se com oportunidades profissionais.',
    cta_botao: 'Cadastre-se'
  }
};

console.log('🚀 Testando PUT /api/paginas...');
console.log('📦 Dados:', JSON.stringify(data, null, 2));

const postData = JSON.stringify(data);

const options = {
  hostname: 'pupiloslani.com.br',
  port: 443,
  path: '/api/paginas',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      console.log('📦 Response Raw:', responseData);
      const parsed = JSON.parse(responseData);
      console.log('✅ Response Parsed:', JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('🎉 SUCESSO! Método:', parsed.method);
      } else {
        console.log('❌ FALHOU:', parsed.error);
      }
    } catch (err) {
      console.log('💥 Parse error:', err.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (err) => {
  console.error('💥 Request error:', err.message);
});

req.write(postData);
req.end();

console.log('⏱️ Aguardando resposta...');