-- Execute este script no SQL Editor do Supabase: https://supabase.com/dashboard/project/ljttishwndzkcytkdsrc/sql

-- Tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS config_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave VARCHAR(255) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplica trigger na tabela se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_config_sistema_updated_at') THEN
        CREATE TRIGGER update_config_sistema_updated_at 
            BEFORE UPDATE ON config_sistema 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Inserir configuração padrão
INSERT INTO config_sistema (chave, valor, descricao) 
VALUES (
  'campos_visibilidade_pupilo',
  '{"mostrar_altura":true,"mostrar_medidas":true,"mostrar_olhos":true,"mostrar_cabelo":true,"mostrar_localizacao":true,"mostrar_especializacoes":true,"mostrar_descricao":true,"mostrar_contatos":true}',
  'Controla quais campos são exibidos na página individual do pupilo'
)
ON CONFLICT (chave) DO NOTHING;