'use client'

import { useState } from 'react'
import { updateOrderStatus, deleteOrder } from '@/app/actions/admin'
import { ConfirmAlert } from '@/lib/toast'

export default function OrderActions({ orderId, currentStatus }: { orderId: number, currentStatus: string }) {
  const [loading, setLoading] = useState(false)

  const change = async (status: string) => {
    setLoading(true)
    await updateOrderStatus(orderId, status)
    setLoading(false)
  }

  const remove = async () => {
    const isConfirmed = await ConfirmAlert.fire('Tens a certeza?', `Queres eliminar a encomenda #${orderId}?`)
    if (!isConfirmed) return
    setLoading(true)
    await deleteOrder(orderId)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus !== 'PAID' && (
        <button onClick={() => change('PAID')} disabled={loading}
          className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 text-xs font-bold rounded-lg transition-all disabled:opacity-50">
          ✓ Marcar Paga
        </button>
      )}
      {currentStatus !== 'CANCELLED' && (
        <button onClick={() => change('CANCELLED')} disabled={loading}
          className="px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 text-xs font-bold rounded-lg transition-all disabled:opacity-50">
          ✕ Cancelar
        </button>
      )}
      {currentStatus !== 'PENDING' && (
        <button onClick={() => change('PENDING')} disabled={loading}
          className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-xs font-bold rounded-lg transition-all disabled:opacity-50">
          ↺ Pendente
        </button>
      )}
      <button onClick={remove} disabled={loading}
        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
        title="Eliminar">
        🗑
      </button>
    </div>
  )
}
