import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/admin - Lista administradores
export async function GET() {
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

// POST /api/admin - Criar administrador
export async function POST(request: Request) {
  try {
    const { email, nome, senha } = await request.json()

    if (!email || !nome || !senha) {
      return NextResponse.json({ error: 'Email, nome e senha são obrigatórios' }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingAdmin } = await supabaseAdmin
      .from('administradores')
      .select('email')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    // Inserir no banco
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

// PUT /api/admin - Atualizar administrador
export async function PUT(request: Request) {
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
      message: `Status alterado com sucesso!`,
      admin: data
    })
  } catch (err: any) {
    console.error('Admin PUT error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin - Excluir administrador
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Verificar se não é o último admin ativo
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