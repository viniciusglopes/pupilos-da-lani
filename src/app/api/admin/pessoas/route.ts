import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pessoas')
      .select('*, fotos(*), videos(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, pessoas: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
