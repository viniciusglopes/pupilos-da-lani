-- PUPILOS DA LANI - Analytics & CMS System
-- Execute este SQL no Supabase SQL Editor

-- 1. ADD MISSING COLUMNS TO PESSOAS TABLE (if not exists)
-- Add destaque column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pessoas' AND column_name='destaque') THEN
        ALTER TABLE pessoas ADD COLUMN destaque BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create index for destaque queries
CREATE INDEX IF NOT EXISTS idx_pessoas_destaque ON pessoas(destaque) WHERE destaque = true;

-- 2. ANALYTICS TABLES

-- Pupilo Click Tracking Table
CREATE TABLE IF NOT EXISTS pupilo_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pupilo_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
    click_date DATE DEFAULT CURRENT_DATE,
    click_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pupilo_id, click_date)
);

-- Site Access Tracking Table
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_date DATE DEFAULT CURRENT_DATE,
    page_path VARCHAR(255),
    user_ip VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(visit_date, page_path, user_ip)
);

-- 3. FOOTER CMS TABLE

-- Footer Content Management Table
CREATE TABLE IF NOT EXISTS footer_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,
    link_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INDEXES FOR PERFORMANCE

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_pupilo_clicks_pupilo_id ON pupilo_clicks(pupilo_id);
CREATE INDEX IF NOT EXISTS idx_pupilo_clicks_date ON pupilo_clicks(click_date);
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_analytics_page ON site_analytics(page_path);

-- Footer content indexes
CREATE INDEX IF NOT EXISTS idx_footer_content_active ON footer_content(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_footer_content_order ON footer_content(display_order);

-- 5. UPDATE TRIGGER FOR FOOTER

-- Trigger for footer updated_at
CREATE OR REPLACE FUNCTION update_footer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_footer_content_updated_at 
    BEFORE UPDATE ON footer_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_footer_updated_at();

-- 6. RLS POLICIES

-- Enable RLS
ALTER TABLE pupilo_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

-- Public read policies for footer content
CREATE POLICY "Footer content is publicly readable" ON footer_content
    FOR SELECT USING (active = true);

-- Analytics policies (admin only for now)
-- Note: You'll need to implement proper admin authentication policies

-- 7. SAMPLE DATA FOR FOOTER

-- Insert sample footer content
INSERT INTO footer_content (section_key, title, content, link_url, display_order, active)
VALUES 
    ('about', 'Sobre Pupilos da Lani', 'Conectamos talentos com oportunidades profissionais em todo Brasil.', NULL, 1, true),
    ('contact', 'Contato', 'Entre em contato conosco para parcerias e oportunidades.', 'mailto:contato@pupilosdalani.com', 2, true),
    ('privacy', 'Privacidade', 'Nossa política de privacidade garante a proteção dos seus dados.', '/privacidade', 3, true),
    ('social_instagram', 'Instagram', '@pupilosdalani', 'https://instagram.com/pupilosdalani', 4, true),
    ('social_whatsapp', 'WhatsApp', 'Fale conosco', 'https://wa.me/5531999999999', 5, true)
ON CONFLICT (section_key) DO NOTHING;

-- 8. USEFUL ANALYTICS FUNCTIONS

-- Function to get top clicked pupilos
CREATE OR REPLACE FUNCTION get_top_clicked_pupilos(
    days_back INTEGER DEFAULT 30,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    pupilo_id UUID,
    nome VARCHAR(255),
    total_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as pupilo_id,
        p.nome,
        COALESCE(SUM(pc.click_count), 0) as total_clicks
    FROM pessoas p
    LEFT JOIN pupilo_clicks pc ON p.id = pc.pupilo_id 
        AND pc.click_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    WHERE p.ativo = true
    GROUP BY p.id, p.nome
    ORDER BY total_clicks DESC, p.nome
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily site stats
CREATE OR REPLACE FUNCTION get_daily_stats(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    visit_date DATE,
    total_visits BIGINT,
    unique_ips BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.visit_date,
        COALESCE(SUM(sa.visit_count), 0) as total_visits,
        COUNT(DISTINCT sa.user_ip) as unique_ips
    FROM site_analytics sa
    WHERE sa.visit_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY sa.visit_date
    ORDER BY sa.visit_date DESC;
END;
$$ LANGUAGE plpgsql;