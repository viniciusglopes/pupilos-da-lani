-- Adicionar campo idade na tabela pessoas
-- Execute no Supabase SQL Editor

ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS idade INTEGER;

-- Atualizar alguns registros de exemplo com idade
UPDATE pessoas 
SET idade = CASE 
  WHEN nome = 'Nicole Lopes' THEN 8
  WHEN nome LIKE '%João Lucas%' THEN 12  
  WHEN nome LIKE '%Vinicius%' THEN 35
  ELSE NULL
END
WHERE nome IN ('Nicole Lopes', 'João Lucas Bueno Lopes', 'Vinicius Guimarães Lopes');

-- Verificar se funcionou
SELECT nome, idade FROM pessoas WHERE idade IS NOT NULL;