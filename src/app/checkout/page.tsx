'use client'

import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createOrder } from '@/app/actions/checkout'
import { getUserBalance } from '@/app/actions/wallet'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, Wallet, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getTotal, getSubtotal, clearCart, appliedCoupon, appliedCreatorCode } = useCartStore()
  const { data: session, status } = useSession()
  
  // Se estiver logado, podemos pré-preencher o nick com o username da sessão
  const [player, setPlayer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const [balance, setBalance] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'EXTERNAL' | 'BALANCE'>('EXTERNAL')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.username && !player) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayer(session.user.username)
    }
    if (session) {
      getUserBalance().then(setBalance)
    }
  }, [session, player])

  if (!mounted || status === 'loading') return null

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center gale-panel my-12">
        <AlertCircle size={80} className="text-red-400 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-white">Sessão Necessária</h1>
        <p className="text-sm text-gray-400 mb-6">Tens de iniciar sessão para finalizar a tua compra. É assim que enviamos os teus itens para o teu Baú!</p>
        <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-bold transition-all">
          Iniciar Sessão
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto animate-fade-in text-center gale-panel my-12 border border-white/10">
        <CheckCircle2 size={80} className="text-neon-pink mb-6 animate-bounce" />
        <h1 className="text-4xl font-extrabold tracking-tighter mb-4 text-white">Encomenda Registada!</h1>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          A tua encomenda <span className="text-neon-blue font-bold">#{orderId}</span> foi criada com sucesso e está pendente de pagamento.
          <br />
          Podes acompanhar o estado no teu perfil ou contactar a equipa no Discord.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/profile" className="px-6 py-3.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-xl transition-all shadow-md">
            Ver Meu Perfil
          </Link>
          <Link href="/loja" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10">
            Voltar à Loja
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center gale-panel my-12">
        <ShoppingBag size={80} className="text-gray-600 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-white">O teu carrinho está vazio</h1>
        <p className="text-sm text-gray-400 mb-6">Adiciona alguns itens na loja antes de finalizar o pedido.</p>
        <Link href="/loja" className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-bold transition-all">
          Ir para a Loja
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createOrder(
      player,
      items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
      getTotal(),
      paymentMethod,
      appliedCoupon?.id,
      appliedCreatorCode?.id
    )

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setOrderId(result.orderId)
      clearCart()
    }
  }

  return (
    <div className="min-h-[70vh] p-4 max-w-5xl mx-auto animate-fade-in flex flex-col gap-8 my-6">
      <Link href="/loja" className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Voltar à loja
      </Link>

      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Finalizar Compra</h1>
        <p className="text-sm text-gray-400 mt-1">Verifica os itens e informa o teu Nick de Minecraft para receberes os artigos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Resumo dos Itens */}
        <div className="gale-panel p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex justify-between items-center">
              <span>Resumo do Pedido</span>
              <span className="text-xs font-normal text-gray-400">{items.length} itens</span>
            </h2>

            <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center text-[9px] text-gray-500 font-bold overflow-hidden">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        'NEXUS'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-400">Qtd: {item.quantity} x {item.price.toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="font-bold text-neon-blue text-sm">
                    {(item.price * item.quantity).toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-2 mb-4">
              {(appliedCoupon || appliedCreatorCode) && (
                <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
                  <span>Subtotal</span>
                  <span>{getSubtotal().toFixed(2)}€</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm font-semibold text-neon-purple">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>-{useCartStore.getState().getDiscountAmount().toFixed(2)}€</span>
                </div>
              )}
              {appliedCreatorCode && (
                <div className="flex justify-between items-center text-sm font-semibold text-yellow-500">
                  <span>Apoio ao Criador ({appliedCreatorCode.code})</span>
                  <span>-{useCartStore.getState().getDiscountAmount().toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total a Pagar</span>
                <span className="text-3xl font-black text-neon-pink">{getTotal().toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Identificação */}
        <div className="gale-panel p-6 sm:p-8 bg-gradient-to-br from-[#0c0c14] to-[#140a25]">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-3">Identificação do Jogador</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                O teu Nick de Minecraft
              </label>
              <div className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{player || session?.user?.name || 'A carregar...'}</span>
                <span className="text-[10px] uppercase font-bold text-neon-blue bg-neon-blue/10 px-2 py-1 rounded-md">
                  Conta Atual
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Os itens comprados serão enviados automaticamente para o baú desta conta.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                Método de Pagamento
              </label>
              
              <div
                onClick={() => setPaymentMethod('EXTERNAL')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'EXTERNAL' 
                    ? 'border-neon-blue bg-neon-blue/10' 
                    : 'border-white/10 bg-black/40 hover:border-white/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'EXTERNAL' ? 'bg-neon-blue text-black' : 'bg-white/5 text-gray-400'}`}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">MBWay / Multibanco / PayPal</h4>
                  <p className="text-xs text-gray-400">Pagar utilizando métodos externos.</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('BALANCE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                  paymentMethod === 'BALANCE' 
                    ? 'border-neon-pink bg-neon-pink/10' 
                    : 'border-white/10 bg-black/40 hover:border-white/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'BALANCE' ? 'bg-neon-pink text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Wallet size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">Saldo da Conta</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    Tens disponível: <span className="font-bold text-neon-pink">{balance.toFixed(2)}€</span>
                  </p>
                </div>
                {balance < getTotal() && (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-md">
                    Saldo Insuficiente
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3.5 rounded-xl border border-red-400/20 text-xs font-semibold">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (paymentMethod === 'BALANCE' && balance < getTotal())}
              className={`w-full py-4 rounded-xl font-extrabold text-sm text-white transition-all shadow-[0_0_20px_-5px_rgba(188,19,254,0.5)] flex items-center justify-center gap-2 ${
                loading || (paymentMethod === 'BALANCE' && balance < getTotal())
                  ? 'bg-gray-600 cursor-not-allowed opacity-70 shadow-none' 
                  : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <span className="animate-pulse">A processar a tua encomenda...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirmar Encomenda
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
