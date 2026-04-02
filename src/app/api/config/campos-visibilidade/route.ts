import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Configurações padrão de visibilidade dos campos
    const campos = {
      mostrar_altura: true,
      mostrar_medidas: true,
      mostrar_olhos: true,
      mostrar_cabelo: true,
      mostrar_localizacao: true,
      mostrar_especializacoes: true,
      mostrar_descricao: true,
      mostrar_contatos: true
    }

    return NextResponse.json({ success: true, campos })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}