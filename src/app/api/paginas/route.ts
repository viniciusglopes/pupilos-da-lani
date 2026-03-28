import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const DATA_DIR = '/tmp/paginas-data'
const getFilePath = (pagina: string) => join(DATA_DIR, `${pagina}.json`)

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function getDefaults(pagina: string) {
  if (pagina === 'parceria') {
    return {
      pagina: 'parceria',
      titulo: 'Modelos Parceiros',
      subtitulo: 'Nossos modelos em parceria exclusiva, prontos para seus projetos.',
      conteudo: {
        banner: 'Modelos em parceria exclusiva - disponibilidade garantida',
        sem_parceiros_titulo: 'Ainda não temos parceiros exclusivos',
        sem_parceiros_texto: 'Em breve teremos nosso primeiro modelo parceiro!',
        secoes: []
      }
    }
  }
  if (pagina === 'home') {
    return {
      pagina: 'home',
      titulo: 'Pupilos da Lani',
      subtitulo: 'Conectando talentos com oportunidades.\nModelos profissionais em Minas Gerais.',
      conteudo: {
        btn_talentos: 'Ver Talentos',
        btn_modelo: 'Seja Modelo',
        destaques_label: 'Destaques',
        destaques_titulo: 'Modelos em Evidência',
        catalogo_label: 'Nosso Catálogo',
        cta_titulo: 'Quer fazer parte?',
        cta_texto: 'Cadastre-se como modelo e conecte-se com oportunidades profissionais.',
        cta_botao: 'Cadastre-se'
      }
    }
  }
  return { pagina, titulo: '', subtitulo: '', conteudo: {} }
}

// Try Supabase first, fallback to file
async function readContent(pagina: string) {
  // Try Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('paginas_conteudo')
      .select('*')
      .eq('pagina', pagina)
      .single()

    if (!error && data) return data
  } catch {}

  // Fallback: local file
  ensureDir()
  const filePath = getFilePath(pagina)
  if (existsSync(filePath)) {
    try {
      return JSON.parse(readFileSync(filePath, 'utf-8'))
    } catch {}
  }

  return getDefaults(pagina)
}

async function writeContent(content: any) {
  const pagina = content.pagina

  // Try Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('paginas_conteudo')
      .upsert(content, { onConflict: 'pagina' })
      .select()
      .single()

    if (!error && data) return data
  } catch {}

  // Fallback: local file
  ensureDir()
  const filePath = getFilePath(pagina)
  writeFileSync(filePath, JSON.stringify(content, null, 2))
  return content
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

    const saved = await writeContent({
      pagina,
      titulo,
      subtitulo,
      conteudo,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, conteudo: saved })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
