import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface HomepageConfig {
  mostrar_titulo: boolean
  mostrar_destaques: boolean
  created_at?: string
  updated_at?: string
}

const DEFAULT_CONFIG: HomepageConfig = {
  mostrar_titulo: true,
  mostrar_destaques: true
}

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_config')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Homepage config GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Se não existe, retornar configurações padrão
    const config = data || DEFAULT_CONFIG

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error('Homepage config GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { mostrar_titulo, mostrar_destaques } = body

    const config = {
      mostrar_titulo: mostrar_titulo !== false,
      mostrar_destaques: mostrar_destaques !== false,
      updated_at: new Date().toISOString()
    }

    // Upsert: inserir se não existe, atualizar se existe
    const { data, error } = await supabaseAdmin
      .from('homepage_config')
      .upsert(config, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Homepage config PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, config: data })
  } catch (error: any) {
    console.error('Homepage config PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}