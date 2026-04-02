// CACHE BUST DEFINITIVO - Executar no DevTools do browser
// Para resolver problemas de cache que impedem visualização das mudanças

console.log('🔄 CACHE BUST DEFINITIVO - Executando...')

// 1. Limpar todos os caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      console.log('🗑️ Deletando cache:', name)
      caches.delete(name)
    })
  })
}

// 2. Limpar localStorage
localStorage.clear()
console.log('🗑️ localStorage limpo')

// 3. Limpar sessionStorage  
sessionStorage.clear()
console.log('🗑️ sessionStorage limpo')

// 4. Reload forçado com cache bust
setTimeout(() => {
  console.log('🚀 Recarregando com cache bust...')
  window.location.href = window.location.href + '?bust=' + Date.now()
}, 1000)

console.log('✅ Cache bust completo! Página recarregará em 1 segundo...')

// ALTERNATIVA: Ctrl+Shift+R (hard refresh) resolve na maioria dos casos