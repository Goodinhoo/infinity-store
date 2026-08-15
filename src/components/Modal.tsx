'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string | ReactNode
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mTimer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(mTimer)
  }, [])

  if (isOpen && !isRendered) {
    setIsRendered(true)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    let transitionTimer: NodeJS.Timeout
    if (isOpen) {
      // Small delay to allow DOM render before triggering opacity transition
      timer = setTimeout(() => setIsVisible(true), 10)
      document.body.style.overflow = 'hidden'
    } else {
      // Wrap in a micro-delay to prevent synchronous setState in effect warning
      transitionTimer = setTimeout(() => setIsVisible(false), 0)
      // Wait for transition to finish before unmounting
      timer = setTimeout(() => {
        setIsRendered(false)
        document.body.style.overflow = 'auto'
      }, 300) // matches transition duration
    }
    
    return () => {
      clearTimeout(timer)
      if (transitionTimer) clearTimeout(transitionTimer)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isRendered || !mounted) return null

  const modalContent = (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-2xl max-h-[85vh] bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_rgba(0,0,0,0.1)]">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
