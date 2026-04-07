import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CHAVE = 'campos_visibilidade_pupilo'

const DEFAULT_CAMPOS = {
  mostrar_altura: true,
  mostrar_medidas: true,
  mostrar_olhos: true,
  mostrar_cabelo: true,
  mostrar_localizacao: true,
  mostrar_especializacoes: true,
  mostrar_descricao: true,
  mostrar_contatos: true
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('config_sistema')
      .select('valor')
      .eq('chave', CHAVE)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: true, campos: DEFAULT_CAMPOS })
    }

    const campos = typeof data.valor === 'string' ? JSON.parse(data.valor) : data.valor
    return NextResponse.json({ success: true, campos })
  } catch (error: any) {
    return NextResponse.json({ success: true, campos: DEFAULT_CAMPOS })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campos } = body

    if (!campos) {
      return NextResponse.json({ error: 'campos required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('config_sistema')
      .upsert(
        {
          chave: CHAVE,
          valor: JSON.stringify(campos),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'chave' }
      )

    if (error) throw error

    return NextResponse.json({ success: true, campos })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
