#!/usr/bin/env node

// DEBUG: Cache issue - Por que GET retorna dados antigos?

const https = require('https');

// Test 1: GET direto
function testGet() {
  return new Promise((resolve) => {
    https.get('https://pupiloslani.com.br/api/paginas?pagina=home', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('📖 GET Response:');
          console.log('   Título:', parsed.conteudo.titulo);
          console.log('   Updated:', parsed.conteudo.updated_at);
          resolve(parsed);
        } catch (err) {
          console.log('❌ GET Parse error:', err.message);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log('❌ GET Request error:', err.message);
      resolve(null);
    });
  });
}

// Test 2: Verificar headers de cache
function testCacheHeaders() {
  return new Promise((resolve) => {
    https.get('https://pupiloslani.com.br/api/paginas?pagina=home', (res) => {
      console.log('📋 Cache Headers:');
      console.log('   Cache-Control:', res.headers['cache-control']);
      console.log('   ETag:', res.headers['etag']);
      console.log('   Last-Modified:', res.headers['last-modified']);
      console.log('   Age:', res.headers['age']);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve());
    }).on('error', resolve);
  });
}

async function main() {
  console.log('🔍 DIAGNÓSTICO CACHE ADMIN CMS');
  console.log('===============================\n');
  
  console.log('1️⃣ Testando GET atual...');
  await testGet();
  
  console.log('\n2️⃣ Verificando headers de cache...');
  await testCacheHeaders();
  
  console.log('\n3️⃣ Testando GET com cache-bust...');
  const cacheBust = '?pagina=home&t=' + Date.now();
  https.get('https://pupiloslani.com.br/api/paginas' + cacheBust, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('📖 GET (cache-bust):');
        console.log('   Título:', parsed.conteudo.titulo);
        console.log('   Updated:', parsed.conteudo.updated_at);
      } catch (err) {
        console.log('❌ Cache-bust error:', err.message);
      }
    });
  });
}

main().catch(console.error);