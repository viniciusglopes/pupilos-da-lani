-- 🔧 FIX SUPABASE TABLES - Pupilos da Lani

-- 1. Verificar tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar estrutura da tabela site_analytics (se existir)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_analytics' AND table_schema = 'public';

-- 3. Criar/recriar tabela site_analytics corretamente
DROP TABLE IF EXISTS site_analytics CASCADE;

CREATE TABLE site_analytics (
  id BIGSERIAL PRIMARY KEY,
  visit_date DATE NOT NULL,
  page_path TEXT NOT NULL,
  user_ip TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_analytics_page ON site_analytics(page_path);
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_analytics_unique 
  ON site_analytics(visit_date, page_path, user_ip);

-- 4. Verificar dados das fotos
SELECT 
  p.id,
  p.nome,
  COUNT(f.id) as total_fotos,
  p.ativo,
  p.destaque
FROM pessoas p 
LEFT JOIN fotos f ON f.pessoa_id = p.id 
GROUP BY p.id, p.nome, p.ativo, p.destaque
ORDER BY total_fotos DESC, p.nome;

-- 5. Verificar se há fotos na tabela
SELECT COUNT(*) as total_fotos_sistema FROM fotos;

-- 6. Verificar buckets de storage
SELECT * FROM storage.buckets WHERE name IN ('fotos', 'videos');

-- 7. Testar insert na tabela analytics
INSERT INTO site_analytics (visit_date, page_path, user_ip, user_agent, referrer, visit_count)
VALUES (CURRENT_DATE, '/test', 'test-ip', 'test-agent', null, 1)
ON CONFLICT (visit_date, page_path, user_ip) 
DO UPDATE SET visit_count = site_analytics.visit_count + 1;

-- 8. Verificar se insert funcionou
SELECT * FROM site_analytics WHERE page_path = '/test';