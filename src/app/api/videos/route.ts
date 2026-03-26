import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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