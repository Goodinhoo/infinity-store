'use client'

import { useState } from 'react'
import { updateUserRole, updateUserBalance, updateUserPassword, sendItemToChest } from '@/app/actions/admin-users'
import { Shield, Coins, Key, Gift, Loader2 } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import { Toast } from '@/lib/toast'

type UserProps = {
  id: number
  role: string
  balance: number
}

type ProductProps = {
  id: number
  name: string
  price: number
}

export function UserForms({ user, products }: { user: UserProps, products: ProductProps[] }) {
  const [loading, setLoading] = useState(false)

  const handleDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const role = formData.get('role') as string
    const balance = parseFloat(formData.get('balance') as string)
    
    let updated = false
    let hasError = false

    if (role !== user.role) {
      const res = await updateUserRole(user.id, role)
      if (res.success) updated = true
      else hasError = true
    }
    
    if (balance !== user.balance) {
      const res = await updateUserBalance(user.id, balance)
      if (res.success) updated = true
      else hasError = true
    }

    if (hasError) Toast.fire({ icon: 'error', title: 'Erro ao guardar dados.' })
    else if (updated) Toast.fire({ icon: 'success', title: 'Dados atualizados!' })
    else Toast.fire({ icon: 'info', title: 'Nenhuma alteração feita.' })
    
    setLoading(false)
  }

  const handlePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    const formData = new FormData(form)
    const password = formData.get('password') as string
    const res = await updateUserPassword(user.id, password)
    if (res.success) Toast.fire({ icon: 'success', title: 'Palavra-passe atualizada!' })
    else Toast.fire({ icon: 'error', title: res.error || 'Erro.' })
    setLoading(false)
    form.reset()
  }

  const handleChest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    const formData = new FormData(form)
    const res = await sendItemToChest(user.id, formData)
    if (res.success) Toast.fire({ icon: 'success', title: 'Item enviado para o Baú!' })
    else Toast.fire({ icon: 'error', title: res.error || 'Erro.' })
    setLoading(false)
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">

        {/* Alterar Detalhes */}
        <div className="gale-panel p-5 border border-white/10 md:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <Shield size={16} className="text-neon-purple" /> Detalhes do Jogador
          </h3>
          <form onSubmit={handleDetails} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cargo</label>
              <CustomSelect
                name="role"
                defaultValue={user.role}
                options={[
                  { value: 'USER', label: 'USER' },
                  { value: 'MODERATOR', label: 'MODERATOR' },
                  { value: 'ADMIN', label: 'ADMIN' }
                ]}
              />
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Saldo</label>
              <div className="flex relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Coins size={16} />
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  name="balance" 
                  defaultValue={user.balance} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-purple transition-all" 
                />
              </div>
            </div>

            <button disabled={loading} className="w-full md:w-auto px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 border border-white/5">
              Guardar
            </button>
          </form>
        </div>

        {/* Alterar Password */}
        <div className="gale-panel p-5 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Key size={16} className="text-neon-pink" /> Nova Palavra-passe
          </h3>
          <form onSubmit={handlePassword} className="flex gap-2">
            <input type="text" name="password" placeholder="Nova password..." required className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple" />
            <button disabled={loading} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 font-bold border border-red-500/30 rounded-lg text-sm transition-all disabled:opacity-50">
              Redefinir
            </button>
          </form>
        </div>

        {/* Enviar para o Baú */}
        <div className="gale-panel p-5 border border-white/10 md:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <Gift size={16} className="text-green-400" /> Enviar Item para o Baú
          </h3>
          <form onSubmit={handleChest} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Escolher Produto</label>
              <CustomSelect
                name="productId"
                required
                options={[
                  { value: '', label: 'Selecione um produto da loja...' },
                  ...products.map(p => ({
                    value: p.id.toString(),
                    label: `${p.name} - ${p.price.toFixed(2)}€`
                  }))
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Descrição Opcional</label>
              <input type="text" name="description" placeholder="Ex: Presente dado por um administrador" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple" />
            </div>
            <div className="flex justify-end mt-2">
              <button disabled={loading} className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/40 text-green-100 font-bold border border-green-500/30 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                Enviar Item
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}
