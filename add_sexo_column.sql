-- Script para adicionar coluna sexo na tabela pessoas
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/ljttishwndzkcytkdsrc/sql

-- Adicionar coluna sexo
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS sexo VARCHAR(10) DEFAULT 'Feminino';

-- Criar índice para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_pessoas_sexo ON pessoas(sexo);

-- Definir valores padrão para registros existentes (opcional)
-- UPDATE pessoas SET sexo = 'Feminino' WHERE sexo IS NULL;

-- Verificar se funcionou
SELECT id, nome, sexo FROM pessoas LIMIT 5;