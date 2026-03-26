import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('🚀 API /modelos iniciada (FETCH DIRETO)')
    
    const formData = await request.json()
    console.log('📝 Dados recebidos:', { nome: formData.nome, email: formData.email })
    
    // Validações básicas
    if (!formData.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    if (formData.email && !formData.consentimento_contato) {
      return NextResponse.json({ 
        error: 'Para cadastrar email, é necessário consentimento de contato' 
      }, { status: 400 })
    }

    if (formData.telefone && !formData.consentimento_contato) {
      return NextResponse.json({ 
        error: 'Para cadastrar telefone, é necessário consentimento de contato' 
      }, { status: 400 })
    }

    // Usar FETCH direto ao Supabase (bypass biblioteca com bug)
    console.log('💾 Inserindo via FETCH direto...')
    const payload = {
      ...formData,
      data_consentimento: formData.consentimento_contato ? new Date().toISOString() : null
    }
    
    const response = await fetch('https://ljttishwndzkcytkdsrc.supabase.co/rest/v1/pessoas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk',
        'Prefer': 'return=representation'  // Retorna o objeto criado
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Fetch error:', response.status, errorText)
      return NextResponse.json({ 
        error: `Erro ${response.status}: ${errorText}`,
        method: 'fetch_direto'
      }, { status: response.status })
    }
    
    const pessoa = await response.json()
    console.log('✅ Pessoa criada com sucesso (fetch):', pessoa[0]?.id)
    
    return NextResponse.json({ 
      success: true,
      pessoa: pessoa[0] || pessoa,
      message: `Modelo "${pessoa[0]?.nome || pessoa.nome}" cadastrado com sucesso!`,
      method: 'fetch_direto'
    })

  } catch (error: any) {
    console.error('💥 Erro geral na API:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor',
      method: 'fetch_direto'
    }, { status: 500 })
  }
}