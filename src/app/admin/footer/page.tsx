'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface FooterContent {
  id: string
  section_key: string
  title: string
  content?: string
  link_url?: string
  display_order: number
  active: boolean
}

export default function AdminFooterPage() {
  const [footerContent, setFooterContent] = useState<FooterContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<FooterContent | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadFooterContent()
  }, [])

  const loadFooterContent = async () => {
    try {
      const res = await fetch('/api/footer')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setFooterContent(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading footer content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (item: Partial<FooterContent>) => {
    try {
      const isEditing = !!editingItem
      const url = '/api/footer'
      const method = isEditing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })

      if (res.ok) {
        await loadFooterContent() // Reload the data
        setEditingItem(null)
        setIsCreating(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Error saving footer content:', error)
      alert('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return

    try {
      const res = await fetch(`/api/footer?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadFooterContent()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir')
      }
    } catch (error) {
      console.error('Error deleting footer content:', error)
      alert('Erro ao excluir')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Gerenciar Footer</h1>
              <p className="text-gray-600 mt-1">Configure o conteúdo do rodapé do site</p>
            </div>
            
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
            >
              Nova Seção
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Current Footer Content */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Seções do Footer</h3>
                </div>
                
                {footerContent.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-400">Nenhuma seção configurada</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {footerContent
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((item) => (
                        <div key={item.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-black">{item.title}</h4>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {item.section_key}
                                </span>
                                {!item.active && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    Inativo
                                  </span>
                                )}
                              </div>
                              
                              {item.content && (
                                <p className="text-gray-600 text-sm mb-2">{item.content}</p>
                              )}
                              
                              {item.link_url && (
                                <p className="text-blue-600 text-sm hover:underline">
                                  <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                                    {item.link_url}
                                  </a>
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-400 mt-2">
                                Ordem: {item.display_order}
                              </p>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Edit/Create Form */}
              {(editingItem || isCreating) && (
                <FooterItemForm
                  item={editingItem}
                  onSave={handleSave}
                  onCancel={() => {
                    setEditingItem(null)
                    setIsCreating(false)
                  }}
                />
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Form Component
interface FooterItemFormProps {
  item: FooterContent | null
  onSave: (item: Partial<FooterContent>) => void
  onCancel: () => void
}

function FooterItemForm({ item, onSave, onCancel }: FooterItemFormProps) {
  const [formData, setFormData] = useState({
    section_key: item?.section_key || '',
    title: item?.title || '',
    content: item?.content || '',
    link_url: item?.link_url || '',
    display_order: item?.display_order || 0,
    active: item?.active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.section_key || !formData.title) {
      alert('Chave da seção e título são obrigatórios')
      return
    }

    const saveData: any = { ...formData }
    if (item) {
      saveData.id = item.id
    }

    onSave(saveData)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-black">
          {item ? 'Editar Seção' : 'Nova Seção'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave da Seção *
            </label>
            <input
              type="text"
              value={formData.section_key}
              onChange={(e) => setFormData(prev => ({ ...prev, section_key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              placeholder="Ex: about, contact, social_instagram"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              placeholder="Ex: Sobre Nós, Contato"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
            rows={3}
            placeholder="Texto descritivo da seção"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do Link
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              placeholder="https://exemplo.com ou mailto:email@exemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              min="0"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Seção ativa
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold tracking-wide uppercase hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}