'use client'

import { Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

interface DeleteButtonProps {
  confirmMessage: string
  title?: string
  className?: string
  children?: ReactNode
}

export default function DeleteButton({
  confirmMessage,
  title = 'Eliminar',
  className = 'p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors',
  children = <Trash2 size={16} />
}: DeleteButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
