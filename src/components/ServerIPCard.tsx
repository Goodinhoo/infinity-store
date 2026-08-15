'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function ServerIPCard({ ip, versions }: { ip: string, versions: string }) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCopy = () => {
    if (showSuccess) return
    navigator.clipboard.writeText(ip)
    
    setShowSuccess(true)

    // Wait 2.5s to read the message, then return to front
    setTimeout(() => {
      setShowSuccess(false)
    }, 2500)
  }

  return (
    <div 
      className="w-full md:w-auto z-10 flex flex-col gap-3 animate-float mt-20 sm:mt-40 cursor-pointer group" 
      style={{ animationDelay: '1s' }} 
      onClick={handleCopy}
    >
      <div className="relative w-full sm:min-w-[260px]">
        
        {/* Lado da Frente */}
        <div className={`w-full h-full p-5 sm:p-6 rounded-2xl bg-black/70 border border-white/20 backdrop-blur-lg flex flex-col gap-3 text-center shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:border-neon-purple/50 transition-all duration-300 ${showSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-300">
            IP do Servidor
          </span>
          <div className="relative px-4 py-3 bg-neon-purple/20 border border-neon-purple/50 rounded-xl text-neon-blue font-mono font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(188,19,254,0.3)] overflow-hidden">
            <div className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
              {ip}
              <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[11px] text-green-400 font-bold flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
            Servidor Online • {versions}
          </span>
        </div>

        {/* Mensagem de Sucesso (Crossfade) */}
        <div className={`absolute inset-0 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/20 border border-neon-purple backdrop-blur-lg flex flex-col justify-center items-center gap-2 text-center shadow-[0_0_30px_rgba(188,19,254,0.4)] w-full h-full transition-opacity duration-300 ${showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showSuccess ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
            <Check size={24} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <span className={`text-sm font-bold uppercase tracking-widest text-white drop-shadow-md transition-all duration-500 delay-100 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            IP Copiado!
          </span>
        </div>
      </div>
    </div>
  )
}
