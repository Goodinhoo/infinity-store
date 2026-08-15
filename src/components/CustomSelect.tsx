'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  group?: string
}

interface CustomSelectProps {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: Option[]
  className?: string
  required?: boolean
}

export default function CustomSelect({
  name,
  value,
  defaultValue,
  onChange,
  options,
  className = '',
  required
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value || defaultValue || (options.length > 0 ? options[0].value : ''))
  const selectRef = useRef<HTMLDivElement>(null)

  const currentValue = value !== undefined ? value : internalValue

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === currentValue)

  const handleSelect = (val: string) => {
    setInternalValue(val)
    setIsOpen(false)
    if (onChange) onChange(val)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Hidden input to maintain native form compatibility */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={currentValue} 
          required={required} 
        />
      )}
      
      <button
        type="button"
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-left text-white focus:outline-none focus:border-neon-purple flex justify-between items-center transition-all hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : 'Selecione...'}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-neon-purple' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0d0d14] border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {Object.entries(
              options.reduce((acc, option) => {
                const groupName = option.group || '';
                if (!acc[groupName]) acc[groupName] = [];
                acc[groupName].push(option);
                return acc;
              }, {} as Record<string, Option[]>)
            ).map(([groupName, groupOptions]) => (
              <div key={groupName}>
                {groupName && (
                  <div className="px-4 py-2 text-[10px] font-black uppercase text-gray-500 tracking-wider bg-white/5 border-y border-white/5 first:border-t-0">
                    {groupName}
                  </div>
                )}
                {groupOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full text-left px-4 py-3 text-sm transition-all hover:bg-white/10 hover:text-white ${
                      currentValue === option.value 
                        ? 'bg-neon-purple/20 text-neon-purple font-bold border-l-2 border-neon-purple' 
                        : 'text-gray-300 border-l-2 border-transparent'
                    } ${groupName ? 'pl-6' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
