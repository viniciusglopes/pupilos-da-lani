'use client'

import { useState, useEffect } from 'react'
import { PessoaCompleta } from '@/types/database'
import ModelCard from './ModelCard'

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(4)

  // Responsive items per slide
  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth >= 1280) { // xl
        setItemsPerSlide(4)
      } else if (window.innerWidth >= 1024) { // lg
        setItemsPerSlide(3)
      } else if (window.innerWidth >= 768) { // md
        setItemsPerSlide(2)
      } else { // sm
        setItemsPerSlide(1)
      }
    }

    updateItemsPerSlide()
    window.addEventListener('resize', updateItemsPerSlide)
    
    return () => window.removeEventListener('resize', updateItemsPerSlide)
  }, [])

  if (!pupilos || pupilos.length === 0) {
    return (
      <section className="mb-24">
        <div className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            {title}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-black">
            {subtitle}
          </p>
        </div>
        <div className="text-center py-24">
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Nenhum pupilo em destaque
          </p>
        </div>
      </section>
    )
  }

  const totalSlides = Math.ceil(pupilos.length / itemsPerSlide)
  const canNavigate = totalSlides > 1

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide
    const endIndex = startIndex + itemsPerSlide
    return pupilos.slice(startIndex, endIndex)
  }

  return (
    <section className="mb-24">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            {title}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-black">
            {subtitle}
          </p>
        </div>

        {/* Navigation arrows */}
        {canNavigate && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={currentSlide === 0}
              aria-label="Slide anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={currentSlide === totalSlides - 1}
              aria-label="Próximo slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Carousel container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-x-6"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`
          }}
        >
          {/* Create slides */}
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const startIndex = slideIndex * itemsPerSlide
            const slideItems = pupilos.slice(startIndex, startIndex + itemsPerSlide)
            
            return (
              <div
                key={slideIndex}
                className="flex-none w-full grid gap-x-6 gap-y-2"
                style={{
                  gridTemplateColumns: `repeat(${itemsPerSlide}, 1fr)`
                }}
              >
                {slideItems.map((pessoa) => (
                  <ModelCard key={pessoa.id} pessoa={pessoa} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Slide indicators */}
      {canNavigate && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-black' : 'bg-gray-300'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 tracking-widest uppercase">
          {pupilos.length} pupilo{pupilos.length !== 1 ? 's' : ''} em destaque
          {canNavigate && ` • Slide ${currentSlide + 1} de ${totalSlides}`}
        </p>
      </div>
    </section>
  )
}