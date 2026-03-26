import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import ModalGallery from './ModalGallery'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCard({ pessoa, isParceiro = false }: ModelCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Foto principal ou primeira foto disponível
  const fotoUrl = pessoa.foto_principal || 
                  pessoa.fotos.find(f => f.eh_principal)?.url_arquivo || 
                  pessoa.fotos[0]?.url_arquivo

  // Medidas formatadas
  const medidas = [pessoa.medidas_busto, pessoa.medidas_cintura, pessoa.medidas_quadril]
    .filter(Boolean)
    .join('-')

  return (
    <>
      <div 
        className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
      {/* Foto principal com overlay */}
      <div className="relative h-80 overflow-hidden">
        {fotoUrl ? (
          <>
            <Image
              src={fotoUrl}
              alt={pessoa.nome}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            
            {/* Overlay que aparece no hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {pessoa.especializacoes?.slice(0, 3).map((spec, index) => (
                    <span 
                      key={index}
                      className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsModalOpen(true)
                    }}
                    className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 text-center py-2 px-3 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
                  >
                    🖼️ Ver Fotos ({pessoa.fotos.length})
                  </button>
                  
                  {pessoa.instagram_url && (
                    <a
                      href={pessoa.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-600/90 backdrop-blur-sm text-white text-center py-2 px-3 rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 Instagram
                    </a>
                  )}
                  
                  {pessoa.telefone && pessoa.consentimento_contato && (
                    <a
                      href={`https://wa.me/${pessoa.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600/90 backdrop-blur-sm text-white text-center py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Badges top */}
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              <div className="flex gap-2">
                {pessoa.destaque && (
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Destaque
                  </span>
                )}
                {isParceiro && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🤝 Parceiro
                  </span>
                )}
              </div>
              
              <div className="flex gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                <span>{pessoa.fotos.length}📸</span>
                <span>{pessoa.videos.length}🎬</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400 text-center">
              <div className="text-6xl mb-3">📷</div>
              <p className="text-sm font-medium">Aguardando Fotos</p>
            </div>
          </div>
        )}
      </div>

      {/* Informações essenciais */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
            {pessoa.nome}
          </h3>
          {pessoa.altura && (
            <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              {pessoa.altura}cm
            </span>
          )}
        </div>

        {/* Localização */}
        {pessoa.localizacao && (
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <span className="text-purple-500 mr-2">📍</span>
            {pessoa.localizacao}
          </p>
        )}

        {/* Medidas (apenas se existir) */}
        {medidas && (
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <span className="text-purple-500 mr-2">📏</span>
            {medidas}
          </p>
        )}

        {/* Descrição resumida */}
        {pessoa.descricao && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {pessoa.descricao}
          </p>
        )}

        {/* Click indicator */}
        <div className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          👆 Clique para ver mais
        </div>
      </div>

      {/* Modal Gallery */}
      <ModalGallery 
        pessoa={pessoa}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}