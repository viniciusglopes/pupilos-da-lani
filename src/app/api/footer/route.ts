import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/footer - Get all footer content
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('footer_content')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching footer content:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar conteúdo do footer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error in footer GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/footer - Create footer section
export async function POST(request: NextRequest) {
  try {
    const { section_key, title, content, link_url, display_order, active } = await request.json()

    if (!section_key || !title) {
      return NextResponse.json(
        { success: false, error: 'section_key e title são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('footer_content')
      .insert({
        section_key,
        title,
        content: content || null,
        link_url: link_url || null,
        display_order: display_order || 0,
        active: active !== false
      })
      .select()

    if (error) {
      console.error('Error creating footer content:', error)
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, error: 'Seção com essa chave já existe' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao criar seção do footer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error in footer POST:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/footer - Update footer content
export async function PUT(request: NextRequest) {
  try {
    const { id, section_key, title, content, link_url, display_order, active } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório para atualização' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (section_key !== undefined) updateData.section_key = section_key
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (link_url !== undefined) updateData.link_url = link_url
    if (display_order !== undefined) updateData.display_order = display_order
    if (active !== undefined) updateData.active = active

    const { data, error } = await supabase
      .from('footer_content')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating footer content:', error)
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, error: 'Seção com essa chave já existe' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar seção do footer' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seção não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error in footer PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/footer - Remove footer section
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório para exclusão' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('footer_content')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting footer content:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao excluir seção do footer' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seção não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Seção excluída com sucesso'
    })

  } catch (error) {
    console.error('Error in footer DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}