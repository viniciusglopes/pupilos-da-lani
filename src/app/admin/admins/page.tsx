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
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    loadAdmins()
  }, [router])

  const loadAdmins = async () => {
    try {
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
          nome: 'Suporte Tecnico',
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
      alert('Administrador excluido com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir administrador')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm uppercase tracking-wide">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
                Administradores
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Gerencie quem tem acesso ao painel administrativo
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm uppercase tracking-wide"
            >
              <span>+ Novo Administrador</span>
            </button>
          </div>

          {/* Formulario de criacao */}
          {showForm && (
            <div className="border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-black uppercase tracking-wide">Novo Administrador</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  X
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newAdmin.nome}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="Nome do administrador"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-widest">
                    Senha Temporaria
                  </label>
                  <input
                    type="password"
                    value={newAdmin.senha}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, senha: e.target.value }))}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="Senha para primeiro acesso"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={createAdmin}
                  className="px-4 py-2 text-white bg-black hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
                >
                  Criar Administrador
                </button>
              </div>
            </div>
          )}

          {/* Lista de administradores */}
          <div className="border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                Lista de Administradores ({admins.length})
              </h3>
            </div>

            {admins.length === 0 ? (
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum administrador cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie o primeiro administrador para comecar.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
                >
                  Criar Primeiro Administrador
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-bold">
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
                      <span className={`border px-2 py-1 text-xs font-medium ${
                        admin.ativo 
                          ? 'border-gray-300 text-gray-700' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {admin.ativo ? 'Ativo' : 'Inativo'}
                      </span>

                      <button
                        onClick={() => toggleAdmin(admin.id)}
                        className="border border-gray-300 text-gray-700 px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
                      >
                        {admin.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => deleteAdmin(admin.id, admin.nome)}
                        className="border border-gray-300 text-gray-700 px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
                        disabled={admin.id === '1'}
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
