import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Footer GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Footer GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { section_key, title, content, link_url, display_order, active } = body

    if (!section_key || !title) {
      return NextResponse.json({ error: 'section_key e title são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('footer_content')
      .insert({
        section_key,
        title,
        content: content || '',
        link_url: link_url || null,
        display_order: display_order || 0,
        active: active !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Footer POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Footer POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, section_key, title, content, link_url, display_order, active } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório para atualização' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('footer_content')
      .update({
        section_key,
        title,
        content: content || '',
        link_url: link_url || null,
        display_order: display_order || 0,
        active: active !== false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Footer PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Footer PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório para exclusão' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('footer_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Footer DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Footer DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}