'use client'

import { useActionState } from 'react'
import { registerAction } from '@/app/actions/user-auth'
import Link from 'next/link'
import { UserPlus, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 my-8 animate-fade-in">
      <div className="gale-panel p-8 sm:p-12 max-w-md w-full border border-white/10 bg-gradient-to-b from-[#0e0e18] to-[#08080c] shadow-2xl flex flex-col gap-6">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px] mb-4 shadow-[0_0_20px_-5px_rgba(188,19,254,0.6)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-neon-blue">
              <UserPlus size={26} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Criar Nova Conta</h1>
          <p className="text-xs text-gray-400 mt-1">Junta-te à rede Infinity Nexus</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5" htmlFor="username">
              Nick de Minecraft
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Ex: Goodinho"
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5" htmlFor="email">
              Endereço de Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="teu.email@exemplo.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5" htmlFor="password">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Escolhe uma palavra-passe forte"
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                required
              />
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_20px_-5px_rgba(188,19,254,0.5)] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isPending ? 'A criar conta...' : 'Criar Conta'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/5 text-xs text-gray-400">
          Já tens uma conta criada?{' '}
          <Link href="/login" className="text-neon-blue font-bold hover:underline">
            Entra aqui
          </Link>
        </div>

      </div>
    </div>
  )
}
