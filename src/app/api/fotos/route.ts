import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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