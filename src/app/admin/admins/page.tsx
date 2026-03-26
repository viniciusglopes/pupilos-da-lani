'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Admin {
  id: string
  email: string
  nome: string
  ativo: boolean
  created_at: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    nome: '',
    senha: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadAdmins()
  }, [router])

  const loadAdmins = async () => {
    try {
      // Simulando dados (substitua por chamada real ao Supabase)
      const mockAdmins: Admin[] = [
        {
          id: '1',
          email: 'admin@pupiloslani.com.br',
          nome: 'Administrador Principal',
          ativo: true,
          created_at: '2026-03-01'
        },
        {
          id: '2', 
          email: 'suporte@pupiloslani.com.br',
          nome: 'Suporte Técnico',
          ativo: true,
          created_at: '2026-03-15'
        }
      ]
      
      setAdmins(mockAdmins)
    } catch (error) {
      console.error('Erro ao carregar administradores:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.nome || !newAdmin.senha) {
      alert('Preencha todos os campos')
      return
    }

    try {
      // Aqui você implementaria a criação real no Supabase
      const newAdminData: Admin = {
        id: Date.now().toString(),
        email: newAdmin.email,
        nome: newAdmin.nome,
        ativo: true,
        created_at: new Date().toISOString().split('T')[0]
      }

      setAdmins(prev => [...prev, newAdminData])
      setNewAdmin({ email: '', nome: '', senha: '' })
      setShowForm(false)
      alert('Administrador criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar administrador:', error)
      alert('Erro ao criar administrador')
    }
  }

  const toggleAdmin = async (id: string) => {
    try {
      setAdmins(prev => prev.map(admin => 
        admin.id === id ? { ...admin, ativo: !admin.ativo } : admin
      ))
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const deleteAdmin = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      return
    }

    try {
      setAdmins(prev => prev.filter(admin => admin.id !== id))
      alert('Administrador excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir administrador')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Administradores
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie quem tem acesso ao painel administrativo
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Novo Administrador</span>
            </button>
          </div>

          {/* Formulário de criação */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Novo Administrador</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newAdmin.nome}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nome do administrador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Temporária
                  </label>
                  <input
                    type="password"
                    value={newAdmin.senha}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, senha: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Senha para primeiro acesso"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createAdmin}
                  className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Criar Administrador
                </button>
              </div>
            </div>
          )}

          {/* Lista de administradores */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Administradores ({admins.length})
              </h3>
            </div>

            {admins.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum administrador cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie o primeiro administrador para começar.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Criar Primeiro Administrador
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {admin.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{admin.nome}</div>
                        <div className="text-sm text-gray-600">{admin.email}</div>
                        <div className="text-xs text-gray-400">
                          Criado em {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.ativo ? 'Ativo' : 'Inativo'}
                      </span>

                      <button
                        onClick={() => toggleAdmin(admin.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          admin.ativo
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {admin.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => deleteAdmin(admin.id, admin.nome)}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                        disabled={admin.id === '1'} // Proteger admin principal
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}