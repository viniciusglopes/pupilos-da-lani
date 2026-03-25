# 🚀 Setup Completo - Pupilos da Lani

## ✅ Status Atual
- ✅ **Código**: Enviado para GitHub (commit 511776d)
- ✅ **Repository**: https://github.com/viniciusglopes/pupilos-da-lani (privado)
- ⏳ **Supabase**: Setup pendente
- ⏳ **Deploy**: Ready para Coolify

## 📋 Próximos Passos

### 1. Setup Supabase (5 minutos)

**Criar Projeto:**
1. Ir em [https://supabase.com](https://supabase.com)
2. "New project" 
3. Nome: `pupilos-da-lani`
4. Região: **São Paulo (South America - East)**
5. Senha DB: `PupilosLani2026!` (anotar)
6. Aguardar criação (~2min)

**Configurar Banco:**
1. Abrir **SQL Editor** no Supabase
2. Copiar **TODO** o conteúdo do arquivo `SCHEMA_BANCO_DADOS.sql`
3. Colar e **Run** (Execute)
4. ✅ Verificar se criou 3 tabelas: `pessoas`, `fotos`, `videos`

**Criar Storage Buckets:**
1. Ir em **Storage** → **Buckets**
2. **New Bucket**: `fotos` → Public ✅ → Create
3. **New Bucket**: `videos` → Public ✅ → Create

**Copiar Credenciais:**
1. **Settings** → **API**
2. Copiar:
   - **Project URL**: `https://[seu-id].supabase.co`
   - **API Key (anon public)**: `eyJ...`
   - **API Key (service_role)**: `eyJ...`

### 2. Configurar Variáveis (.env.local)

Criar arquivo `.env.local` na raiz:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[seu-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[sua-chave-anonima]
SUPABASE_SERVICE_ROLE_KEY=eyJ[sua-service-role-key]

# Admin Configuration  
NEXT_PUBLIC_ADMIN_PASSWORD=admin2026
```

### 3. Testar Local

```bash
npm run dev
```

**Testes:**
- http://localhost:3000 → HomePage
- http://localhost:3000/parceria → Página parceiros
- http://localhost:3000/login → Login admin (senha: admin2026)
- http://localhost:3000/privacidade → LGPD

### 4. Deploy Coolify

**Configuração Docker:**
1. **Coolify** → New Resource → Git Repository
2. **Repository**: `viniciusglopes/pupilos-da-lani`
3. **Branch**: `main`
4. **Build Pack**: Docker
5. **Port**: `3000`

**Dockerfile** (já criado):
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Environment Variables no Coolify:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

**Deploy:** → Start Deployment

### 5. Configurar Domínio

**Coolify:**
1. **Domains** → Add Domain
2. `pupilos.vinculodigital.com.br`
3. SSL automático ✅

**Cloudflare/Hostinger:**
- A record: `pupilos` → IP do Coolify

## 🎯 Resultado Esperado

**Portal funcionando com:**
- ✅ Homepage lista modelos
- ✅ Página parceiros exclusivos
- ✅ Login administrativo
- ✅ Upload fotos/vídeos
- ✅ LGPD compliance
- ✅ Interface responsiva
- ✅ Supabase backend

## 🚨 Troubleshooting

**Erro: Supabase connection failed**
→ Verificar credenciais em `.env.local`

**Erro: Table doesn't exist**
→ Executar `SCHEMA_BANCO_DADOS.sql` novamente

**Erro: Upload failed**
→ Verificar se buckets `fotos` e `videos` estão criados

**Erro: Build failed**
→ Verificar se todas env vars estão configuradas

## 📞 Pronto!

**URLs finais:**
- **Local**: http://localhost:3000
- **Produção**: https://pupilos.vinculodigital.com.br
- **GitHub**: https://github.com/viniciusglopes/pupilos-da-lani
- **Supabase**: Dashboard do projeto

**Login Admin:** `/login` com senha configurada

**Tempo total esperado:** 15-20 minutos