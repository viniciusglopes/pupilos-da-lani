import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/admin - Lista administradores (requer auth)
export async function GET(request: Request) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('administradores')
      .select('id, email, nome, ativo, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, admins: data })
  } catch (err: any) {
    console.error('Admin GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin - Criar administrador (requer auth)
export async function POST(request: Request) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { email, nome, senha } = await request.json()

    if (!email || !nome || !senha) {
      return NextResponse.json({ error: 'Email, nome e senha são obrigatórios' }, { status: 400 })
    }

    const { data: existingAdmin } = await supabaseAdmin
      .from('administradores')
      .select('email')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(senha, 10)

    const { data, error } = await supabaseAdmin
      .from('administradores')
      .insert({
        email: email.toLowerCase().trim(),
        nome: nome.trim(),
        senha: hashedPassword,
        ativo: true
      })
      .select('id, email, nome, ativo, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `Administrador "${nome}" criado com sucesso!`,
      admin: data
    })
  } catch (err: any) {
    console.error('Admin POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/admin - Atualizar administrador (requer auth)
export async function PUT(request: Request) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id, ativo } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('administradores')
      .update({ ativo })
      .eq('id', id)
      .select('id, email, nome, ativo')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Status alterado com sucesso!',
      admin: data
    })
  } catch (err: any) {
    console.error('Admin PUT error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin - Excluir administrador (requer auth)
export async function DELETE(request: Request) {
  const admin = verifyAuth(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data: activeAdmins } = await supabaseAdmin
      .from('administradores')
      .select('id')
      .eq('ativo', true)

    if (activeAdmins && activeAdmins.length <= 1) {
      return NextResponse.json({ error: 'Não é possível excluir o último administrador ativo' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('administradores')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Administrador excluído com sucesso!'
    })
  } catch (err: any) {
    console.error('Admin DELETE error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
