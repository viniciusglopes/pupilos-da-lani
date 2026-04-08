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
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Homepage config GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Se não existe, retornar configurações padrão
    const config = data || DEFAULT_CONFIG

    return NextResponse.json({ success: true, config }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
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

    // Buscar o registro mais recente
    const { data: existingData } = await supabaseAdmin
      .from('homepage_config')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let result
    if (existingData) {
      // Atualizar o registro mais recente
      const { data, error } = await supabaseAdmin
        .from('homepage_config')
        .update(config)
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Criar novo registro
      const { data, error } = await supabaseAdmin
        .from('homepage_config')
        .insert(config)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, config: result })
  } catch (error: any) {
    console.error('Homepage config PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}