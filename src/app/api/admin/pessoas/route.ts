import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('pessoas')
      .select('*, fotos(*), videos(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status === 'ativo') query = query.eq('ativo', true)
    else if (status === 'inativo') query = query.eq('ativo', false)
    else if (status === 'parceiro') query = query.eq('parceria', true)
    else if (status === 'destaque') query = query.eq('destaque', true)

    if (search) query = query.ilike('nome', `%${search}%`)

    const { data, error, count } = await query
    if (error) throw error

    const response = NextResponse.json({ success: true, pessoas: data, total: count || 0 })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST mantido para retrocompatibilidade (evita cache do proxy Coolify)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const limit = body.limit || 50
    const offset = body.offset || 0
    const status = body.status || ''
    const search = body.search || ''

    let query = supabaseAdmin
      .from('pessoas')
      .select('*, fotos(*), videos(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status === 'ativo') query = query.eq('ativo', true)
    else if (status === 'inativo') query = query.eq('ativo', false)
    else if (status === 'parceiro') query = query.eq('parceria', true)
    else if (status === 'destaque') query = query.eq('destaque', true)

    if (search) query = query.ilike('nome', `%${search}%`)

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ success: true, pessoas: data, total: count || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
