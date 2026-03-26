import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    console.log('🧪 Teste FETCH direto (bypass biblioteca Supabase)')
    
    const payload = {
      ...formData,
      data_consentimento: formData.consentimento_contato ? new Date().toISOString() : null
    }
    
    const response = await fetch('https://ljttishwndzkcytkdsrc.supabase.co/rest/v1/pessoas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdHRpc2h3bmR6a2N5dGtkc3JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDY2MywiZXhwIjoyMDkwMDQ2NjYzfQ.1AWXeQ-0WtWsSRyOtQoh8YJR6hiz9nn-5wV6A86ifuk'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Fetch error:', response.status, errorText)
      return NextResponse.json({ 
        error: `HTTP ${response.status}: ${errorText}`,
        fetch_test: 'failed'
      }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('✅ Fetch success:', data)
    
    return NextResponse.json({ 
      success: true,
      data,
      fetch_test: 'success',
      message: `FETCH FUNCIONOU! Modelo "${data.nome}" cadastrado`
    })
    
  } catch (error: any) {
    console.error('💥 Erro fetch:', error)
    return NextResponse.json({ 
      error: error.message,
      fetch_test: 'error'
    }, { status: 500 })
  }
}