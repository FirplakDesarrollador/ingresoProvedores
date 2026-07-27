'use client'

import React, { useState, useEffect } from 'react'
import { getBancosSap } from '@/app/registro/actions'

interface BancoSelectProps {
  value: string;
  onChange: (field: string, value: string) => void;
  className?: string;
}

export default function BancoSelect({ value, onChange, className = '' }: BancoSelectProps) {
  const [bancos, setBancos] = useState<string[]>(['Bancolombia', 'Davivienda', 'Nequi'])

  useEffect(() => {
    async function loadBancos() {
      const res = await getBancosSap()
      if (res.success && res.data.length > 0) {
        setBancos(res.data.map((b: any) => b.BankName).sort())
      }
    }
    loadBancos()
  }, [])

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">Entidad Bancaria</label>
      <select
        name="entidad_bancaria"
        value={value || ''}
        onChange={(e) => onChange('entidad_bancaria', e.target.value)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#254153] focus:ring-[#254153] sm:text-sm p-2 border"
      >
        <option value="">Seleccione una opción</option>
        {bancos.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  )
}
