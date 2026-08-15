'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { getWheelSettings, getWheelItems, getRecentWinners, spinWheel, getUserNextSpinTime } from '@/app/actions/fortune-wheel'
import { getModules } from '@/app/actions/settings'
import { AlertCircle, History } from 'lucide-react'
import { FortuneWheelItem } from '@/generated/prisma'

type WinnerHistory = {
  id: number;
  userId: number;
  itemId: number;
  createdAt: Date;
  user: { id: number; username: string | null; name: string | null; avatar: string | null; };
  item: FortuneWheelItem;
}

export default function RoletaPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({ cost: 0, cooldownMinutes: 0 })
  const [items, setItems] = useState<FortuneWheelItem[]>([])
  const [winners, setWinners] = useState<WinnerHistory[]>([])
  const [loading, setLoading] = useState(true)

  const [spinning, setSpinning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultItem, setResultItem] = useState<FortuneWheelItem | null>(null)
  
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  // Guardar a rotação para os renders estáticos
  const [rotation, setRotation] = useState(0)

  const wheelRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLImageElement>(null)
  const rotationRef = useRef(0)
  
  // Roda

  const loadData = async () => {
    const [sets, its, wins, nextSpin, modules] = await Promise.all([
      getWheelSettings(), getWheelItems(), getRecentWinners(10), getUserNextSpinTime(), getModules()
    ])
    
    if (!modules.MODULE_FORTUNE_WHEEL) {
      router.push('/')
      return
    }

    setSettings(sets)
    setItems(its)
    setWinners(wins)
    setNextSpinTime(nextSpin)
    setLoading(false)
  }

  useEffect(() => {
    if (!nextSpinTime) return

    const updateTimer = () => {
      const now = new Date()
      const diff = nextSpinTime.getTime() - now.getTime()
      if (diff <= 0) {
        setNextSpinTime(null)
        setTimeRemaining('')
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [nextSpinTime])

  const tickAudio = useRef<HTMLAudioElement | null>(null)
  const winAudio = useRef<HTMLAudioElement | null>(null)
  const loseAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // eslint-disable-next-line
    loadData()
    tickAudio.current = new Audio('/sounds/tick.mp3')
    winAudio.current = new Audio('/sounds/win.mp3')
    loseAudio.current = new Audio('/sounds/lose.mp3')
  }, [])

  const handleSpin = async () => {
    if (spinning || items.length === 0) return
    setError(null)
    setResultItem(null)
    setSpinning(true)

    const res = await spinWheel()

    if (!res.success) {
      setError(res.error || 'Erro ao girar.')
      setSpinning(false)
      return
    }

    // Calcular qual a fatia que deve ficar para cima (posição 0 graus)
    const winningItem = res.item || null
    
    // Animação CSS (Fake physics)
    // Encontrar o index do item vencedor
    const itemIndex = items.findIndex(i => i.id === winningItem?.id)
    const sliceAngle = 360 / items.length
    
    // Roda várias vezes
    // Mais o ângulo para parar na fatia correta (temos de inverter porque roda para a direita)
    const targetAngle = 360 - (itemIndex * sliceAngle + (sliceAngle / 2))
    const extraSpins = 360 * 4 // 4 voltas para um spin mais claro

    const startRotation = rotationRef.current
    const finalRotation = startRotation + extraSpins + targetAngle - (startRotation % 360)
    rotationRef.current = finalRotation

    const startTime = performance.now()
    const duration = 5000
    let lastTickIndex = -1
    let tickTimeout: NodeJS.Timeout | null = null

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const currentRotation = startRotation + (finalRotation - startRotation) * easeProgress
      
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${currentRotation}deg)`
      }

      // Qual é o ângulo debaixo do ponteiro (0 graus)?
      const pointerAngle = (360 - (currentRotation % 360)) % 360
      const currentSliceIndex = Math.floor(pointerAngle / sliceAngle)

      if (lastTickIndex !== -1 && currentSliceIndex !== lastTickIndex) {
        if (tickAudio.current) {
          tickAudio.current.currentTime = 0
          tickAudio.current.play().catch(() => {})
        }
        // Animação da seta
        if (pointerRef.current) {
          if (tickTimeout) clearTimeout(tickTimeout)
          
          // Force reset sem transição para que acompanhe logo a velocidade
          pointerRef.current.style.transition = 'none'
          pointerRef.current.style.transform = 'rotate(-15deg)'
          
          // Forçar reflow
          void pointerRef.current.offsetHeight
          
          // Restaurar a transição para voltar suavemente ao zero
          pointerRef.current.style.transition = 'transform 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          
          tickTimeout = setTimeout(() => {
            if (pointerRef.current) pointerRef.current.style.transform = 'rotate(0deg)'
          }, 30)
        }
      }
      lastTickIndex = currentSliceIndex

      if (progress < 1) {
        requestAnimationFrame(animateSpin)
      } else {
        setRotation(finalRotation) // Sincroniza o React state com o valor final
        setSpinning(false)
        setResultItem(winningItem || null)
        if (winningItem && winningItem.type !== 'EMPTY') {
          winAudio.current?.play().catch(() => {})
          Swal.fire({
            title: 'Parabéns!',
            text: `Ganhaste: ${winningItem.name}!`,
            icon: 'success',
            background: '#0d0d14',
            color: '#fff',
            confirmButtonColor: '#bc13fe'
          }).then(() => {
            loadData() // Recarrega os dados e inicia o contador após fechar
          })
        } else {
          loseAudio.current?.play().catch(() => {})
          Swal.fire({
            title: 'Que pena...',
            text: 'Não ganhaste prémio desta vez.',
            icon: 'error',
            background: '#0d0d14',
            color: '#fff',
            confirmButtonColor: '#bc13fe'
          }).then(() => {
            loadData()
          })
        }
      }
    }

    requestAnimationFrame(animateSpin)
  }

  if (loading) return <div className="p-12 text-center text-gray-500">A carregar a roleta...</div>

  // CSS Conic Gradient para a Roda (usando graus para maior precisão)
  const wheelSlices = items.map((item, index) => {
    const end = ((index + 1) / items.length) * 360
    return `${item.color} 0 ${end}deg`
  }).join(', ')

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Roleta Area */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 gale-panel border border-white/10 relative overflow-hidden">
          {/* Luzes / Decoração */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none" />

          <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2 text-center">Roda da Fortuna</h1>
          <p className="text-gray-400 mb-8 text-center text-sm">Gira a roda e ganha prémios fantásticos!</p>

          {/* Wheel Container */}
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Pointer (Seta) */}
            <Image 
              ref={pointerRef}
              src="/images/pointer.svg" 
              alt="Pointer" 
              width={64}
              height={64}
              className="absolute top-[-20px] md:top-[-28px] left-0 right-0 mx-auto w-8 md:w-10 h-auto z-20 origin-top drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
              style={{ transform: 'rotate(0deg)' }}
            />
            
            <div 
              ref={wheelRef}
              className="w-full h-full rounded-full border-4 border-white/10 relative overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)` // Usa o state no render para evitar o erro do linter
              }}
            >
              {/* Background gradient maior para esconder o bug de renderização nas bordas do browser */}
              <div 
                className="absolute -inset-4"
                style={{ background: `conic-gradient(${wheelSlices})` }}
              />

              {/* Separator lines to hide gradient aliasing and show boundaries */}
              {items.map((_, index) => {
                const angle = index * (360 / items.length)
                return (
                  <div 
                    key={`sep-${index}`}
                    className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white/30 origin-bottom z-0"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                  />
                )
              })}

              {/* Items Overlay */}
              {items.map((item, index) => {
                const angle = (index * 360) / items.length
                const sliceAngle = 360 / items.length
                return (
                  <div 
                    key={item.id} 
                    className="absolute top-0 left-1/2 w-8 h-1/2 flex justify-center items-start pt-6 origin-bottom"
                    style={{
                      transform: `translateX(-50%) rotate(${angle + (sliceAngle / 2)}deg)`,
                    }}
                  >
                    <span 
                      className="text-white font-black text-sm md:text-base uppercase tracking-widest text-center max-w-[140px] break-words"
                      style={{ 
                        writingMode: 'vertical-rl',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)'
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                )
              })}
              {/* Inner Circle (Cubo Central) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-background rounded-full border-4 border-white/10 z-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <button 
              onClick={handleSpin} 
              disabled={spinning || items.length === 0 || !!nextSpinTime}
              className={`px-12 py-4 font-black uppercase tracking-widest text-lg rounded-xl transition-all ${
                !!nextSpinTime 
                  ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30 shadow-[0_0_30px_rgba(188,19,254,0.1)] cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50'
              }`}
            >
              {spinning ? 'A girar...' : nextSpinTime ? `Espera: ${timeRemaining}` : `Girar agora (${settings.cost > 0 ? settings.cost + ' Moedas' : 'Grátis'})`}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg text-sm font-bold">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {resultItem && (
              <div className="flex flex-col items-center gap-2 mt-4 animate-fade-in">
                <div className="text-xs font-bold text-neon-purple uppercase tracking-widest">Resultado</div>
                <div className={`text-xl md:text-2xl font-black px-6 py-3 rounded-xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${resultItem.type === 'EMPTY' ? 'text-red-400' : 'text-green-400'}`}>
                  {resultItem.type === 'EMPTY' ? 'Não ganhaste prémio :(' : `Ganhaste: ${resultItem.name}!`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="gale-panel p-6 border border-white/10">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
              <History size={16} className="text-neon-purple" /> Últimos Vencedores
            </h2>
            <div className="space-y-3">
              {winners.map((win, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={win.user?.avatar || `https://mc-heads.net/avatar/${win.user?.username || 'steve'}`} className="w-8 h-8 rounded-lg" alt="" />
                    <div>
                      <p className="text-sm font-bold text-white">{win.user?.username || 'Anónimo'}</p>
                      <p className="text-xs text-gray-400">{win.item.name}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {new Date(win.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {winners.length === 0 && <p className="text-sm text-gray-500">Nenhum vencedor recente.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
