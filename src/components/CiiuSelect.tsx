'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { getActividadesEconomicas } from '@/app/registro/actions'

interface CiiuSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CiiuSelect({ value, onChange, className = '' }: CiiuSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [ciiuList, setCiiuList] = useState<Array<{codigo: string, descripcion: string}>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadActivities() {
      const res = await getActividadesEconomicas()
      if (res.success) {
        setCiiuList(res.data.map((item: any) => ({
          codigo: String(item.Code),
          descripcion: item.Descripcion
        })))
      }
    }
    loadActivities()
  }, [])

  const selectedItem = useMemo(() => {
    if (!value) return null;
    const match = ciiuList.find(item => item.codigo === value || `${item.codigo} - ${item.descripcion}` === value);
    return match ? `${match.codigo} - ${match.descripcion}` : value;
  }, [value, ciiuList])

  useEffect(() => {
    setSearch(selectedItem || '')
  }, [selectedItem])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch(selectedItem || '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedItem])

  const filteredList = useMemo(() => {
    if (!search) return ciiuList.slice(0, 50);
    const lowerSearch = search.toLowerCase();
    return ciiuList.filter(item => 
      item.codigo.toLowerCase().includes(lowerSearch) || 
      item.descripcion.toLowerCase().includes(lowerSearch)
    ).slice(0, 50);
  }, [search, ciiuList])

  const handleSelect = (codigo: string, descripcion: string) => {
    const fullText = `${codigo} - ${descripcion}`;
    setSearch(fullText);
    onChange(fullText);
    setIsOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Actividad Económica
      </label>
      <input
        type="text"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#254153] focus:ring-[#254153] sm:text-sm p-2 border"
        placeholder="Buscar por código o concepto..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
          if (e.target.value === '') {
             onChange('');
          }
        }}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div
                key={item.codigo}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                onClick={() => handleSelect(item.codigo, item.descripcion)}
              >
                <span className="block truncate font-medium">{item.codigo}</span>
                <span className="block truncate text-xs text-gray-500 whitespace-normal">{item.descripcion}</span>
              </div>
            ))
          ) : (
            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
              {ciiuList.length === 0 ? "Cargando actividades..." : "No se encontraron resultados"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
