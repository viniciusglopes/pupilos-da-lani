import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CHAVE = 'site_header_config'

const DEFAULT_CONFIG = {
  logo_url: '',
  logo_texto: 'Pupilos da Lani',
  favicon_url: '',
  bg_color: '#ffffff',
  text_color: '#000000',
  menu_items: [
    { label: 'Início', href: '/' },
    { label: 'Talentos', href: '/busca' },
  ]
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('config_sistema')
      .select('valor')
      .eq('chave', CHAVE)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: true, config: DEFAULT_CONFIG })
    }

    const config = typeof data.valor === 'string' ? JSON.parse(data.valor) : data.valor
    return NextResponse.json({ success: true, config })
  } catch {
    return NextResponse.json({ success: true, config: DEFAULT_CONFIG })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json({ error: 'config required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('config_sistema')
      .upsert(
        {
          chave: CHAVE,
          valor: JSON.stringify(config),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'chave' }
      )

    if (error) throw error

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
