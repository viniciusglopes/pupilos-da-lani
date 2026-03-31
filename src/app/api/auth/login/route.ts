import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'pupiloslani-secret-2026'

// POST /api/auth/login - Autenticação de administrador
export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // Buscar admin no banco
    const { data: admin, error } = await supabaseAdmin
      .from('administradores')
      .select('id, email, nome, senha, ativo')
      .eq('email', email.toLowerCase().trim())
      .eq('ativo', true)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Gerar JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        nome: admin.nome 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({ 
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome
      }
    })
  } catch (err: any) {
    console.error('Login error:', err.message)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}