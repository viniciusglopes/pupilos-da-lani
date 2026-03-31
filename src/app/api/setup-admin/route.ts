import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST /api/setup-admin - Setup inicial da tabela e primeiro admin
export async function POST() {
  try {
    // Tentar criar a tabela via SQL bruto
    const createTableSQL = `
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
    `

    // Executar via RPC function (se existir) ou direto
    try {
      const { error: tableError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL })
      if (tableError) {
        console.log('RPC exec_sql não disponível, tentando método alternativo...')
      }
    } catch {
      console.log('Método RPC falhou, continuando...')
    }

    // Tentar inserir o primeiro admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const { data, error } = await supabaseAdmin
      .from('administradores')
      .upsert({
        email: 'admin@pupiloslani.com.br',
        nome: 'Administrador Principal',
        senha: hashedPassword,
        ativo: true
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      // Se deu erro, provavelmente a tabela não existe
      return NextResponse.json({ 
        error: 'Tabela não existe. Execute o SQL manualmente no Supabase Dashboard.',
        sql: `
CREATE TABLE IF NOT EXISTS public.administradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  nome varchar(255) NOT NULL,
  senha varchar(255) NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.administradores (email, nome, senha, ativo)
VALUES ('admin@pupiloslani.com.br', 'Administrador Principal', '${hashedPassword}', true)
ON CONFLICT (email) DO NOTHING;
        `.trim()
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Setup realizado com sucesso! Login: admin@pupiloslani.com.br / admin123',
      admin: data
    })

  } catch (err: any) {
    console.error('Setup error:', err.message)
    return NextResponse.json({ 
      error: err.message,
      hint: 'Execute o SQL manualmente no Supabase Dashboard' 
    }, { status: 500 })
  }
}

// GET /api/setup-admin - Verificar se tabela existe
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('administradores')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ 
        exists: false,
        error: error.message 
      })
    }

    return NextResponse.json({ 
      exists: true,
      message: 'Tabela administradores encontrada'
    })
  } catch (err: any) {
    return NextResponse.json({ 
      exists: false,
      error: err.message 
    })
  }
}