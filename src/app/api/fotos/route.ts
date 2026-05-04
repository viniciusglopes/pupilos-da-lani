import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: Request) {
  try {
    const { id, caminho_storage } = await request.json()

    if (caminho_storage) {
      await supabaseAdmin.storage.from('fotos').remove([caminho_storage])
    }

    const { error } = await supabaseAdmin.from('fotos').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { pessoa_id, url_arquivo, caminho_storage, eh_principal, ordem } = await request.json()
    
    // Inserir foto usando supabaseAdmin (bypassa RLS)
    const { data: foto, error: fotoError } = await supabaseAdmin
      .from('fotos')
      .insert({
        pessoa_id,
        url_arquivo,
        caminho_storage,
        eh_principal,
        ordem
      })
      .select()
      .single()

    if (fotoError) {
      console.error('Erro inserindo foto:', fotoError)
      return NextResponse.json({ error: fotoError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, foto })

  } catch (error: any) {
    console.error('Erro na API fotos:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}