-- Adicionar campo destaque na tabela pessoas
-- Execute este comando no Supabase SQL Editor

ALTER TABLE pessoas 
ADD COLUMN destaque BOOLEAN NOT NULL DEFAULT FALSE;

-- Adicionar comentário descritivo
COMMENT ON COLUMN pessoas.destaque IS 'Campo para marcar modelos como destaque na tela principal';

-- Criar índice para consultas rápidas
CREATE INDEX idx_pessoas_destaque ON pessoas(destaque) WHERE destaque = true;

-- Verificar se foi criado corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pessoas' AND column_name = 'destaque';