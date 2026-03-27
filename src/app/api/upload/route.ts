import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pessoa_id = formData.get('pessoa_id') as string
    const type = formData.get('type') as 'foto' | 'video'
    const eh_principal = formData.get('eh_principal') === 'true'
    const ordem = parseInt(formData.get('ordem') as string) || 0

    if (!file || !pessoa_id || !type) {
      return NextResponse.json({ error: 'Missing required fields: file, pessoa_id, type' }, { status: 400 })
    }

    const bucket = type === 'foto' ? 'fotos' : 'videos'
    const table = type === 'foto' ? 'fotos' : 'videos'
    const fileExt = file.name.split('.').pop()
    const fileName = `${pessoa_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage using supabaseAdmin (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    // Insert record in database using supabaseAdmin (bypasses RLS)
    const { data: record, error: dbError } = await supabaseAdmin
      .from(table)
      .insert({
        pessoa_id,
        url_arquivo: publicUrl,
        caminho_storage: fileName,
        eh_principal,
        ordem
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, record, url: publicUrl })

  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
