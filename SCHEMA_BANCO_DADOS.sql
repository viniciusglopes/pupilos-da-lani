-- Schema para Pupilos da Lani
-- Execute este SQL no Supabase SQL Editor

-- Tabela de Pessoas/Modelos
CREATE TABLE IF NOT EXISTS pessoas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    altura INTEGER, -- em centímetros
    cor_olhos VARCHAR(50),
    cor_cabelo VARCHAR(50),
    medidas_busto INTEGER,
    medidas_cintura INTEGER,
    medidas_quadril INTEGER,
    especializacoes TEXT[], -- array de especialidades
    localizacao VARCHAR(255), -- cidade/estado
    instagram_url VARCHAR(500),
    email VARCHAR(255),
    telefone VARCHAR(20),
    consentimento_contato BOOLEAN DEFAULT false,
    data_consentimento TIMESTAMP WITH TIME ZONE,
    parceria BOOLEAN DEFAULT false,
    foto_principal VARCHAR(500), -- URL da foto principal
    video_principal VARCHAR(500), -- URL do vídeo principal
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fotos
CREATE TABLE IF NOT EXISTS fotos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
    url_arquivo VARCHAR(500) NOT NULL,
    caminho_storage VARCHAR(500), -- caminho no storage do Supabase
    eh_principal BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vídeos
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
    url_arquivo VARCHAR(500) NOT NULL,
    caminho_storage VARCHAR(500), -- caminho no storage do Supabase
    eh_principal BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pessoas_parceria ON pessoas(parceria);
CREATE INDEX IF NOT EXISTS idx_pessoas_ativo ON pessoas(ativo);
CREATE INDEX IF NOT EXISTS idx_fotos_pessoa_id ON fotos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_videos_pessoa_id ON videos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_fotos_principal ON fotos(eh_principal);
CREATE INDEX IF NOT EXISTS idx_videos_principal ON videos(eh_principal);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_pessoas_updated_at 
    BEFORE UPDATE ON pessoas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Configurar permissões
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (somente pessoas ativas)
CREATE POLICY "Pessoas ativas são públicas" ON pessoas
    FOR SELECT USING (ativo = true);

-- Política para fotos/vídeos de pessoas ativas
CREATE POLICY "Fotos de pessoas ativas são públicas" ON fotos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pessoas 
            WHERE pessoas.id = fotos.pessoa_id 
            AND pessoas.ativo = true
        )
    );

CREATE POLICY "Vídeos de pessoas ativas são públicos" ON videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pessoas 
            WHERE pessoas.id = videos.pessoa_id 
            AND pessoas.ativo = true
        )
    );

-- Buckets de Storage (executar no Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Políticas de Storage
-- CREATE POLICY "Fotos públicas" ON storage.objects FOR SELECT USING (bucket_id = 'fotos');
-- CREATE POLICY "Vídeos públicos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');