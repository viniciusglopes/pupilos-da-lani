import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function getDefaults(pagina: string) {
  if (pagina === 'parceria') {
    return {
      pagina: 'parceria',
      titulo: 'Pupilos Parceiros',
      subtitulo: 'Nossos pupilos em parceria exclusiva, prontos para seus projetos.',
      conteudo: {
        banner: 'Pupilos em parceria exclusiva - disponibilidade garantida',
        sem_parceiros_titulo: 'Ainda não temos parceiros exclusivos',
        sem_parceiros_texto: 'Em breve teremos nosso primeiro pupilo parceiro!',
        secoes: []
      }
    }
  }
  if (pagina === 'home') {
    return {
      pagina: 'home',
      titulo: 'Pupilos da Lani',
      subtitulo: 'Conectando talentos com oportunidades.\nPupilos profissionais em Minas Gerais.',
      conteudo: {
        btn_talentos: 'Ver Talentos',
        btn_modelo: 'Seja Pupilo',
        destaques_label: 'Destaques',
        destaques_titulo: 'Pupilos em Evidência',
        catalogo_label: 'Nosso Catálogo',
        cta_titulo: 'Quer fazer parte?',
        cta_texto: 'Cadastre-se como pupilo e conecte-se com oportunidades profissionais.',
        cta_botao: 'Cadastre-se'
      }
    }
  }
  return { pagina, titulo: '', subtitulo: '', conteudo: {} }
}

// Leitura simples via Supabase
async function readContent(pagina: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('paginas_conteudo')
      .select('*')
      .eq('pagina', pagina)
      .single()

    if (error) {
      // Se não encontrou o registro, retornar defaults
      if (error.code === 'PGRST116') {
        return getDefaults(pagina)
      }
      throw error
    }

    return data
  } catch (error: any) {
    // Em caso de erro, retornar defaults
    return getDefaults(pagina)
  }
}

async function writeContent(content: any) {
  const { data, error } = await supabaseAdmin
    .from('paginas_conteudo')
    .upsert(content, { onConflict: 'pagina' })
    .select()
    .single()

  if (error) {
    throw error
  }
  
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pagina = searchParams.get('pagina')

  if (!pagina) {
    return NextResponse.json({ error: 'pagina parameter required' }, { status: 400 })
  }

  const conteudo = await readContent(pagina)
  
  return NextResponse.json({ success: true, conteudo })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { pagina, titulo, subtitulo, conteudo } = body

    if (!pagina) {
      return NextResponse.json({ error: 'pagina required' }, { status: 400 })
    }

    const contentToSave = {
      pagina,
      titulo: titulo || '',
      subtitulo: subtitulo || '',
      conteudo: conteudo || {},
      updated_at: new Date().toISOString()
    }
    
    const saved = await writeContent(contentToSave)
    
    return NextResponse.json({ success: true, conteudo: saved })
  } catch (err: any) {
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 })
  }
}
