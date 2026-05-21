import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pessoas')
      .select('*, fotos(*), videos(*)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, pessoa: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { error } = await supabaseAdmin
      .from('pessoas')
      .update(body)
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
