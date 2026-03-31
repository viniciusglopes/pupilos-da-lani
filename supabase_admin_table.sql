-- Script SQL para criar tabela de administradores
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/ljttishwndzkcytkdsrc/sql)

CREATE TABLE IF NOT EXISTS public.administradores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    nome varchar(255) NOT NULL,
    senha varchar(255) NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_administradores_email ON public.administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_ativo ON public.administradores(ativo);

-- RLS (Row Level Security) - opcional por enquanto
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;

-- Política: apenas usuários autenticados via service_role podem acessar
CREATE POLICY "Allow service_role access" ON public.administradores
FOR ALL USING (auth.role() = 'service_role');

-- Inserir primeiro administrador padrão (senha: admin123)
-- Hash bcrypt para "admin123": $2a$10$N7T2.6rNNE5xCZ1j8MXNTO3J8B3LXJ2c9F7L9K8Ln1o3RgXeXOYLu
INSERT INTO public.administradores (email, nome, senha, ativo)
VALUES (
    'admin@pupiloslani.com.br',
    'Administrador Principal', 
    '$2a$10$N7T2.6rNNE5xCZ1j8MXNTO3J8B3LXJ2c9F7L9K8Ln1o3RgXeXOYLu',
    true
) ON CONFLICT (email) DO NOTHING;

-- Comentário sobre senha padrão
-- IMPORTANTE: Senha padrão é "admin123"
-- Recomenda-se alterar após primeiro login via painel admin