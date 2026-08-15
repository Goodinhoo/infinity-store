'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

type SliderItem = {
  id: number
  title: string
  subtitle: string | null
  badge: string | null
  imageUrl: string
  buttonText: string | null
  buttonLink: string | null
}

export default function HeroSlider({
  sliders,
  discordUrl
}: {
  sliders: SliderItem[]
  discordUrl: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length)
  }, [sliders.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length)
  }, [sliders.length])

  // Autoplay a cada 5 segundos
  useEffect(() => {
    if (sliders.length <= 1) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [sliders.length, handleNext])

  if (!sliders || sliders.length === 0) return null

  const currentSlide = sliders[currentIndex]

  return (
    <section className="relative w-full h-[450px] sm:h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none transition-all">
      {/* Background Image Carousel with Fade */}
      {sliders.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 mix-blend-overlay" />
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col justify-between p-8 sm:p-16 max-w-3xl animate-fade-in">
        <div>
          {currentSlide.badge && (
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md w-fit animate-float">
              <Sparkles size={16} className="text-neon-blue" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {currentSlide.badge}
              </span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
            {currentSlide.title}
          </h1>

          {currentSlide.subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-4 max-w-2xl leading-relaxed opacity-90 drop-shadow-md">
              {currentSlide.subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href={currentSlide.buttonLink || '/loja'}
            className="px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            <ShoppingBag size={18} />
            {currentSlide.buttonText || 'Explorar a Loja'}
          </Link>
          <a
            href={discordUrl.startsWith('http') ? discordUrl : `https://${discordUrl}`}
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            Comunidade Discord
          </a>
        </div>
      </div>

      {/* Navigation Chevrons (if multiple slides) */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Seguinte"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
            {sliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
