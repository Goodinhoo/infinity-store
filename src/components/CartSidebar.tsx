'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { validateCoupon } from '@/app/actions/admin-coupons'
import { verifyCreatorCode } from '@/app/actions/creator-codes'
import { getCashbackPercentage } from '@/app/actions/settings'
import { useModules } from './Providers'
import { Toast } from '@/lib/toast'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon, appliedCreatorCode, applyCreatorCode, removeCreatorCode } = useCartStore()
  const modules = useModules()
  const [mounted, setMounted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [cashbackPct, setCashbackPct] = useState(0)

  useEffect(() => {
    if (modules.MODULE_CASHBACK) {
      getCashbackPercentage().then(setCashbackPct)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [modules.MODULE_CASHBACK])

  if (!mounted || !isOpen) return null

  const handleApplyCode = async () => {
    if (!couponCode.trim()) return
    setValidating(true)
    
    // Tenta primeiro como Cupão
    const resCoupon = await validateCoupon(couponCode.trim())
    if (resCoupon.valid && resCoupon.couponId && resCoupon.discountPct) {
      applyCoupon({ 
        id: resCoupon.couponId, 
        code: couponCode.trim().toUpperCase(), 
        discountPct: resCoupon.discountPct,
        applicableCategoryIds: resCoupon.applicableCategoryIds || [],
        applicableProductIds: resCoupon.applicableProductIds || []
      })
      setCouponCode('')
      Toast.fire({ icon: 'success', title: `Cupão aplicado! (-${resCoupon.discountPct}%)` })
      setValidating(false)
      return
    }
    
    // Tenta como Código de Criador (apenas se o módulo estiver ativo)
    if (modules.MODULE_CREATORS) {
      const resCreator = await verifyCreatorCode(couponCode.trim())
      if (resCreator.success && resCreator.code) {
        applyCreatorCode({
          id: resCreator.code.id,
          code: resCreator.code.code,
          discountPercent: resCreator.code.discountPercent,
          rewardPercent: resCreator.code.rewardPercent
        })
        setCouponCode('')
        Toast.fire({ icon: 'success', title: `Código de Criador aplicado! (-${resCreator.code.discountPercent}%)` })
        setValidating(false)
        return
      }
      
      // Se ambos falharem e o módulo estiver ativo
      Toast.fire({ icon: 'error', title: resCreator.error || resCoupon.error || 'Código inválido' })
      setValidating(false)
      return
    }

    // Se falhar (e apenas testámos cupões)
    Toast.fire({ icon: 'error', title: resCoupon.error || 'Código inválido' })
    setValidating(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c0c14] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-neon-blue" size={24} />
              <h2 className="text-xl font-bold tracking-tight text-white">O Teu Carrinho</h2>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                <ShoppingBag size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-1 text-gray-300">O carrinho está vazio</p>
                <p className="text-xs max-w-xs">Adiciona produtos da nossa loja para avançares com a encomenda.</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[10px] text-gray-500 font-bold overflow-hidden relative">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        'NEXUS'
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-neon-blue font-semibold">{item.price.toFixed(2)}€</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout Button */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/40 space-y-4">
              
              {/* Code Field */}
              <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-neon-purple/10 border border-neon-purple/30 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2 text-neon-purple">
                      <Tag size={16} />
                      <span className="font-bold text-sm tracking-widest uppercase">{appliedCoupon.code}</span>
                      <span className="bg-neon-purple text-white text-[10px] px-1.5 py-0.5 rounded font-black">-{appliedCoupon.discountPct}%</span>
                    </div>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-red-400 p-1 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : appliedCreatorCode ? (
                  <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Tag size={16} />
                      <span className="font-bold text-sm tracking-widest uppercase">{appliedCreatorCode.code}</span>
                      <span className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded font-black">-{appliedCreatorCode.discountPercent}%</span>
                    </div>
                    <button onClick={removeCreatorCode} className="text-gray-400 hover:text-red-400 p-1 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={modules.MODULE_CREATORS ? "Cupão ou Código de Criador" : "Código de Desconto"} 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-neon-purple placeholder:normal-case placeholder:text-gray-500"
                    />
                    <button 
                      onClick={handleApplyCode}
                      disabled={validating || !couponCode.trim()}
                      className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[70px]"
                    >
                      {validating ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {(appliedCoupon || appliedCreatorCode) && (
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span>Subtotal</span>
                    <span>{getSubtotal().toFixed(2)}€</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-xs font-semibold text-neon-purple">
                    <span>Desconto Cupão ({appliedCoupon.code})</span>
                    <span>-{useCartStore.getState().getDiscountAmount().toFixed(2)}€</span>
                  </div>
                )}
                {appliedCreatorCode && (
                  <div className="flex justify-between items-center text-xs font-semibold text-yellow-500">
                    <span>Apoio ao Criador ({appliedCreatorCode.code})</span>
                    <span>-{useCartStore.getState().getDiscountAmount().toFixed(2)}€</span>
                  </div>
                )}
                {modules.MODULE_CASHBACK && cashbackPct > 0 && getTotal() > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-green-400 mt-2 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                    <span>🎉 Vais receber Cashback:</span>
                    <span>+ {((getTotal() * cashbackPct) / 100).toFixed(2)} Créditos</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-semibold text-gray-400 mt-1">
                  <span>Total</span>
                  <span className="text-2xl font-extrabold text-neon-pink">{getTotal().toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  Esvaziar
                </button>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(188,19,254,0.5)] flex items-center justify-center gap-2"
                >
                  Finalizar Compra
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
