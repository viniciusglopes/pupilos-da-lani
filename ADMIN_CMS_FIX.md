# 🔧 ADMIN CMS FIX - Solução Definitiva

## 🚨 PROBLEMA IDENTIFICADO (02/04/2026 01h42 UTC)

**ROOT CAUSE:** Deploy automático GitHub→Coolify quebrado há ~5+ horas

### Evidências:
- ✅ PUT /api/paginas funciona (Supabase salva corretamente)
- ❌ GET /api/paginas retorna dados antigos (código deploy antigo)
- ❌ Cache-bust falha (confirma deploy não aplicado)
- ⏰ Última atualização real: 2026-04-01T17:22:56 (ontem)

### Teste Definitivo:
```bash
# PUT salva com sucesso:
node test_admin_cms.js
# Result: "TESTE BILLY ADMIN CMS 01h38" saved at 2026-04-02T01:39:58 ✅

# GET retorna dados antigos:
curl "https://pupiloslani.com.br/api/paginas?pagina=home"
# Result: empty title, updated 2026-04-01T17:22:56 ❌
```

## ✅ AÇÃO REQUERIDA

**VINNY: FORCE DEPLOY MANUAL NO COOLIFY**

1. Acesse: http://31.97.42.252:8000
2. Projeto: Pupilos da Lani
3. Force Rebuild + Deploy

**RESULTADO ESPERADO:**
- ✅ GET /api/paginas retorna dados atualizados
- ✅ Admin CMS funciona 100%
- ✅ Página individual fotos aparecem (SimpleImage deploy)

## 📋 COMMITS PENDENTES DEPLOY:

- `10b7a1e` - SimpleImage component (resolve fotos pupilos)
- `7563e6e` - Force deploy (tentativa webhook)
- Múltiplas correções admin CMS

## 🎯 CONFIRMAÇÃO PÓS-DEPLOY:

```bash
# Verificar se dados novos aparecem:
curl "https://pupiloslani.com.br/api/paginas?pagina=home" | jq '.conteudo.titulo'
# Deve retornar: "TESTE BILLY ADMIN CMS 01h38"
```

---
**PRIORIDADE MÁXIMA:** Deploy manual resolve 2 problemas críticos de uma vez.