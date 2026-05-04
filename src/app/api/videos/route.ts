import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: Request) {
  try {
    const { id, caminho_storage } = await request.json()

    if (caminho_storage) {
      await supabaseAdmin.storage.from('videos').remove([caminho_storage])
    }

    const { error } = await supabaseAdmin.from('videos').delete().eq('id', id)
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
    
    // Inserir vídeo usando supabaseAdmin (bypassa RLS)
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .insert({
        pessoa_id,
        url_arquivo,
        caminho_storage,
        eh_principal,
        ordem
      })
      .select()
      .single()

    if (videoError) {
      console.error('Erro inserindo vídeo:', videoError)
      return NextResponse.json({ error: videoError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, video })

  } catch (error: any) {
    console.error('Erro na API vídeos:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}