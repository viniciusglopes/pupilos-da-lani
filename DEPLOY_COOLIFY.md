# 🚀 DEPLOY COOLIFY - Pupilos da Lani

## ✅ Supabase Configurado
- URL: https://ljttishwndzkcytkdsrc.supabase.co
- Banco: 3 tabelas criadas (pessoas, fotos, videos)
- Storage: Buckets fotos + videos
- RLS: Configurado

## 🔧 COOLIFY SETUP (5 min)

### PASSO 1: Criar Aplicação
1. **Coolify Dashboard** → **+ New**
2. **Git Repository** → **Public repository**
3. **Repository URL**: `https://github.com/viniciusglopes/pupilos-da-lani`
4. **Branch**: `main`
5. **Build Pack**: **Docker** (detecta automaticamente)

### PASSO 2: Environment Variables
**Na seção Environment Variables, adicionar:**

```
NEXT_PUBLIC_SUPABASE_URL=https://ljttishwndzkcytkdsrc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2NjMsImV4cCI6MjA5MDA0NjY2M30.4lH691aAK1hdIhFXVQxmzvyGTxTnGuVnTZEMN_8clpA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk
NEXT_PUBLIC_ADMIN_PASSWORD=admin2026
```

### PASSO 3: Configurações
- **Port**: `3000` (padrão Next.js)
- **Health Check**: `/api/health` (já configurado)
- **Auto Deploy**: ✅ ON (deploy automático git push)

### PASSO 4: Deploy
1. **Save Configuration**
2. **Deploy** → Aguardar build (~3-5 min)
3. **Success!** → Aplicação rodando

### PASSO 5: Domínio Personalizado
1. **Domains** → **Add Domain**
2. **Domain**: `pupilos.vinculodigital.com.br`
3. **Redirect www**: ✅ (opcional)
4. **SSL**: Auto-generated ✅

### PASSO 6: DNS (Hostinger/Cloudflare)
**Adicionar record A:**
- **Name**: `pupilos` 
- **Value**: `[IP-do-Coolify]` (mostrado no dashboard)
- **TTL**: Auto

## 🎯 URLs Finais
- **Produção**: https://pupilos.vinculodigital.com.br
- **Coolify URL**: https://[app-id].31.97.42.252.sslip.io
- **Health Check**: https://pupilos.vinculodigital.com.br/api/health

## 🔐 Login Admin
- **URL**: https://pupilos.vinculodigital.com.br/login
- **Senha**: `admin2026`

## ✅ Teste Funcionalidades
1. **Homepage**: Lista modelos (vazia inicialmente)
2. **Admin Login**: /login com senha admin2026
3. **Cadastro Modelo**: /admin/cadastro com upload
4. **Busca**: /busca com filtros
5. **Parceiros**: /parceria

## 🚀 RESULTADO
Portal profissional de modelos MG completo:
- Interface elegante preto/cinza/branco
- Sistema CRUD admin
- Upload fotos/vídeos
- Busca avançada
- LGPD compliance
- Deploy automatizado

**Status: PRODUCTION READY! 🎉**