import { PessoaCompleta } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'

interface ModelCardProps {
  pessoa: PessoaCompleta
  isParceiro?: boolean
}

export default function ModelCard({ pessoa, isParceiro = false }: ModelCardProps) {
  // Foto principal ou primeira foto disponível
  const fotoUrl = pessoa.foto_principal || 
                  pessoa.fotos.find(f => f.eh_principal)?.url_arquivo || 
                  pessoa.fotos[0]?.url_arquivo

  // Medidas formatadas
  const medidas = [pessoa.medidas_busto, pessoa.medidas_cintura, pessoa.medidas_quadril]
    .filter(Boolean)
    .join('-')

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Badge Parceiro */}
      {isParceiro && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
          Parceiro
        </div>
      )}

      {/* Foto principal */}
      <div className="relative h-80 bg-gray-200">
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={pessoa.nome}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Sem foto</p>
            </div>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {pessoa.nome}
          </h3>
          {pessoa.altura && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {pessoa.altura}cm
            </span>
          )}
        </div>

        {/* Localização */}
        {pessoa.localizacao && (
          <p className="text-sm text-gray-600 mb-2">
            📍 {pessoa.localizacao}
          </p>
        )}

        {/* Medidas */}
        {medidas && (
          <p className="text-sm text-gray-600 mb-2">
            📏 {medidas}
          </p>
        )}

        {/* Especialidades */}
        {pessoa.especializacoes && pessoa.especializacoes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pessoa.especializacoes.slice(0, 2).map((spec, index) => (
              <span 
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
            {pessoa.especializacoes.length > 2 && (
              <span className="text-xs text-gray-500">
                +{pessoa.especializacoes.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Descrição resumida */}
        {pessoa.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pessoa.descricao}
          </p>
        )}

        {/* Botões de contato */}
        <div className="flex gap-2">
          {pessoa.instagram_url && (
            <a
              href={pessoa.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-3 rounded text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Instagram
            </a>
          )}
          
          {pessoa.telefone && pessoa.consentimento_contato && (
            <a
              href={`https://wa.me/${pessoa.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </a>
          )}
        </div>

        {/* Contador de fotos/vídeos */}
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          <span>{pessoa.fotos.length} foto{pessoa.fotos.length !== 1 ? 's' : ''}</span>
          <span>{pessoa.videos.length} vídeo{pessoa.videos.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}