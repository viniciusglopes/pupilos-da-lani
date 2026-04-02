# 📋 EXECUTAR ESTE SQL NO SUPABASE

**URGENTE**: Execute este SQL no Supabase SQL Editor para a funcionalidade funcionar:

```sql
-- Criar tabela para configurações da homepage
CREATE TABLE IF NOT EXISTS public.homepage_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mostrar_destaques boolean DEFAULT true NOT NULL,
    mostrar_catalogo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.homepage_config (mostrar_destaques, mostrar_catalogo)
VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos
CREATE POLICY "Allow public read access" ON public.homepage_config
    FOR SELECT USING (true);

-- Política para permitir escrita apenas para service_role
CREATE POLICY "Allow service_role full access" ON public.homepage_config
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.homepage_config TO service_role;
GRANT SELECT ON public.homepage_config TO anon;
GRANT SELECT ON public.homepage_config TO authenticated;
```

## COMO EXECUTAR:

1. Abra Supabase Dashboard
2. Vá em SQL Editor  
3. Cole o código acima
4. Execute (RUN)
5. ✅ Tabela criada!

## FUNCIONALIDADE:

Depois da tabela criada, você poderá:

- **Admin**: `https://pupiloslani.com.br/admin/homepage-config`
- **Ligar/Desligar**: Seção Destaques dinamicamente
- **Controle Total**: Das seções da homepage

---

**Status**: ⏳ Aguardando execução do SQL