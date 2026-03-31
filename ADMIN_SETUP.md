# Setup Sistema de Administradores

## ⚡ Setup Rápido

### 1. Criar Tabela no Supabase

Acesse: https://supabase.com/dashboard/project/ljttishwndzkcytkdsrc/sql

Cole e execute este SQL:

```sql
CREATE TABLE IF NOT EXISTS public.administradores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    nome varchar(255) NOT NULL,
    senha varchar(255) NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_administradores_email ON public.administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_ativo ON public.administradores(ativo);

-- Primeiro administrador (admin@pupiloslani.com.br / admin123)
INSERT INTO public.administradores (email, nome, senha, ativo)
VALUES (
    'admin@pupiloslani.com.br',
    'Administrador Principal', 
    '$2b$10$MLc1IPiirUGap9LFigvXrushljVn3pzS6.R.I8F3fQiJYdUlDGrGa',
    true
) ON CONFLICT (email) DO NOTHING;
```

### 2. Deploy + Teste

Após executar o SQL:

1. ✅ Deploy automático no Coolify (commit já vai subir)
2. ✅ Acesse: https://pupiloslani.com.br/login  
3. ✅ Login: `admin@pupiloslani.com.br` / `admin123`
4. ✅ Vá em **Admin → Administradores** e crie novos usuários
5. ✅ Altere a senha padrão criando um novo admin com seu email

## 🔧 Sistema Implementado

### Recursos:

- ✅ **Login com email + senha** (não mais senha única)
- ✅ **Gestão de administradores** via painel admin
- ✅ **Senhas criptografadas** (bcrypt)
- ✅ **JWT tokens** (sessões seguras)
- ✅ **CRUD completo** de admins (criar, editar, ativar/desativar, excluir)
- ✅ **Proteção anti-exclusão** do último admin ativo

### APIs criadas:

- `POST /api/auth/login` - Autenticação
- `GET /api/admin` - Listar administradores  
- `POST /api/admin` - Criar administrador
- `PUT /api/admin` - Ativar/desativar
- `DELETE /api/admin` - Excluir administrador

### Arquivos modificados:

- `src/app/login/page.tsx` - Campo email + nova autenticação
- `src/app/admin/admins/page.tsx` - CRUD real (não mais mock)
- `src/app/api/admin/route.ts` - API administradores
- `src/app/api/auth/login/route.ts` - Autenticação JWT

## 🚀 Deploy

Commit atual já tem tudo pronto. Após executar o SQL no Supabase, o sistema estará 100% funcional!