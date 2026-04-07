'use client'

import { PessoaCompleta } from '@/types/database'
import ModelCard from './ModelCard'
import Link from 'next/link'

interface FeaturedPupilosCarouselProps {
  pupilos: PessoaCompleta[]
  title?: string
  subtitle?: string
}

export default function FeaturedPupilosCarousel({
  pupilos,
  title = "Destaques",
  subtitle = "Pupilos em Evidência"
}: FeaturedPupilosCarouselProps) {
  if (!pupilos || pupilos.length === 0) return null

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            {title}
          </h2>
          <p className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-black">
            {subtitle}
          </p>
        </div>
        <Link
          href="/busca"
          className="text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors hidden sm:block"
        >
          Ver Todos →
        </Link>
      </div>

      {/* Scroll horizontal com snap — funciona em mobile e desktop */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 -mx-6 px-6 md:-mx-0 md:px-0 scrollbar-hide">
        {pupilos.map((pessoa) => (
          <div
            key={pessoa.id}
            className="snap-start flex-none w-[44vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] xl:w-[15vw]"
          >
            <ModelCard pessoa={pessoa} />
          </div>
        ))}
      </div>

      <Link
        href="/busca"
        className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors sm:hidden block text-center"
      >
        Ver Todos →
      </Link>
    </section>
  )
}
