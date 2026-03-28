'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    if (password === adminPassword) {
      localStorage.setItem('admin_authenticated', 'true')
      router.push('/admin')
    } else {
      setError('Senha incorreta')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-black mb-2 uppercase tracking-widest">
              Login Administrativo
            </h1>
            <p className="text-gray-500 text-sm">
              Acesso restrito para administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <div className="border border-gray-300 p-3">
                <p className="text-gray-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>
              Esqueceu a senha? Entre em contato com o desenvolvedor.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
