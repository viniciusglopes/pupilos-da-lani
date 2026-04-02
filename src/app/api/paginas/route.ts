import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DATA_DIR = '/tmp/paginas-data'
const getFilePath = (pagina: string) => join(DATA_DIR, `${pagina}.json`)

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

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

// FORÇAR SUPABASE - sem fallback file que causa cache antigo
async function readContent(pagina: string) {
  console.log('📖 readContent chamado para:', pagina)
  
  // SEMPRE tentar Supabase primeiro
  try {
    const { data, error } = await supabaseAdmin
      .from('paginas_conteudo')
      .select('*')
      .eq('pagina', pagina)
      .single()

    if (error) {
      console.error('❌ Supabase read error:', error.message)
      
      // Se não encontrou o registro, criar um padrão
      if (error.code === 'PGRST116') {
        console.log('📝 Registro não encontrado, retornando defaults')
        return getDefaults(pagina)
      }
    } else if (data) {
      console.log('✅ Supabase read success:', { titulo: data.titulo, updated_at: data.updated_at })
      return data
    }
  } catch (supabaseError: any) {
    console.error('💥 Supabase connection error:', supabaseError.message)
  }

  // APENAS EM CASO EXTREMO: fallback para arquivo local
  console.log('⚠️ Usando fallback file (deve ser raro)')
  ensureDir()
  const filePath = getFilePath(pagina)
  if (existsSync(filePath)) {
    try {
      const fileData = JSON.parse(readFileSync(filePath, 'utf-8'))
      console.log('📁 File fallback usado:', fileData.titulo)
      return fileData
    } catch (fileError) {
      console.error('💥 File fallback failed:', fileError)
    }
  }

  console.log('🔄 Usando defaults como último recurso')
  return getDefaults(pagina)
}

async function writeContent(content: any) {
  const pagina = content.pagina
  
  console.log('💾 writeContent chamado:', { pagina, titulo: content.titulo })

  // Try Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('paginas_conteudo')
      .upsert(content, { onConflict: 'pagina' })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase upsert error:', error)
      throw error
    }
    
    if (data) {
      console.log('✅ Supabase upsert success:', data.titulo)
      return data
    }
  } catch (e: any) {
    console.error('💥 Supabase fallback error:', e.message)
  }

  // Fallback: local file
  ensureDir()
  const filePath = getFilePath(pagina)
  writeFileSync(filePath, JSON.stringify(content, null, 2))
  console.log('📁 Salvou em arquivo local:', filePath)
  return content
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pagina = searchParams.get('pagina')

  console.log('🚀 GET /api/paginas chamado:', pagina)

  if (!pagina) {
    return NextResponse.json({ error: 'pagina parameter required' }, { status: 400 })
  }

  const conteudo = await readContent(pagina)
  
  console.log('📦 GET retornando:', { 
    pagina: conteudo.pagina, 
    titulo: conteudo.titulo,
    updated_at: conteudo.updated_at 
  })

  const getResponse = NextResponse.json({ success: true, conteudo })
  
  // ANTI-CACHE HEADERS AGRESSIVOS
  getResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  getResponse.headers.set('Pragma', 'no-cache')
  getResponse.headers.set('Expires', '0')
  getResponse.headers.set('Surrogate-Control', 'no-store')
  
  return getResponse
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { pagina, titulo, subtitulo, conteudo } = body
    
    console.log('🚀 PUT /api/paginas chamado:', { pagina, titulo, keys: Object.keys(conteudo || {}) })

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
    
    console.log('📦 Conteúdo a salvar:', JSON.stringify(contentToSave, null, 2))

    // FORÇAR SALVAMENTO - Tentar Supabase primeiro, depois arquivo
    let saved = null
    let method = 'unknown'

    try {
      // Método 1: Supabase
      const { data, error } = await supabaseAdmin
        .from('paginas_conteudo')
        .upsert(contentToSave, { onConflict: 'pagina' })
        .select()
        .single()

      if (!error && data) {
        saved = data
        method = 'supabase'
        console.log('✅ Salvou no Supabase:', data.titulo)
      } else {
        console.error('❌ Supabase error:', error)
        throw new Error('Supabase failed')
      }
    } catch (supabaseError: any) {
      console.error('💥 Supabase fallback:', supabaseError.message)
      
      // Método 2: Arquivo local (fallback)
      try {
        ensureDir()
        const filePath = getFilePath(pagina)
        writeFileSync(filePath, JSON.stringify(contentToSave, null, 2))
        saved = contentToSave
        method = 'file'
        console.log('✅ Salvou em arquivo:', filePath)
      } catch (fileError: any) {
        console.error('💥 File fallback failed:', fileError.message)
        throw fileError
      }
    }
    
    if (!saved) {
      throw new Error('Falha em todos os métodos de salvamento')
    }
    
    console.log(`✅ PUT finalizado com sucesso (${method})`)
    const putResponse = NextResponse.json({ success: true, conteudo: saved, method })
    
    // ANTI-CACHE HEADERS AGRESSIVOS
    putResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    putResponse.headers.set('Pragma', 'no-cache')
    putResponse.headers.set('Expires', '0')
    putResponse.headers.set('Surrogate-Control', 'no-store')
    
    return putResponse
  } catch (err: any) {
    console.error('💥 PUT CRITICAL ERROR:', err)
    return NextResponse.json({ error: `Falha crítica: ${err.message}` }, { status: 500 })
  }
}
