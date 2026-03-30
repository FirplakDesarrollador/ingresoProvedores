'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LogEntry {
  id: number
  created_at: string
  usuario: string
  accion: string
  modulo: string
  detalles: any
  tipo: 'INFO' | 'WARNING' | 'ERROR'
  status: 'SUCCESS' | 'FAILURE'
}

export default function LogsTable() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('logs_sistema')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching logs:', error)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => 
    log.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.modulo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'ERROR': return 'text-red-700 bg-red-100 border-red-200 shadow-sm'
      case 'WARNING': return 'text-amber-700 bg-amber-100 border-amber-200 shadow-sm'
      case 'INFO': return 'text-[#254153] bg-blue-50 border-blue-100 shadow-sm'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="p-6 border-b border-gray-50 bg-[#F9FAFB]/50 flex justify-between items-center gap-4 flex-wrap">
        <div>
           <h2 className="text-xl font-bold text-[#254153]">Auditoría de Actividad</h2>
           <p className="text-sm text-gray-500 mt-1">Monitoreo en tiempo real de los últimos eventos del sistema.</p>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Filtrar por usuario, acción o módulo..."
            className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-80 transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#254153]/70 text-[11px] font-bold uppercase tracking-[0.1em] border-y border-gray-50">
              <th className="px-8 py-5">Fecha / Hora</th>
              <th className="px-6 py-5">Usuario Responsable</th>
              <th className="px-6 py-5">Área / Módulo</th>
              <th className="px-6 py-5">Acción</th>
              <th className="px-6 py-5 text-center">Severidad</th>
              <th className="px-8 py-5 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-6 h-16 bg-gray-50/10"></td>
                </tr>
              ))
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base">No hay rastros de actividad registrados</p>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F9FAFB] transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-blue-500">
                <td className="px-8 py-5 whitespace-nowrap">
                   <div className="flex flex-col">
                      <span className="font-semibold text-[#254153]">
                        {new Date(log.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-gray-400 tabular-nums">
                        {new Date(log.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-5 font-medium text-[#254153]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200">
                      {log.usuario?.charAt(0).toUpperCase()}
                    </div>
                    {log.usuario}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100/80 text-gray-600 font-bold text-[10px] uppercase border border-gray-200">
                    {log.modulo}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-700 font-medium">{log.accion}</td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${getTipoColor(log.tipo)}`}>
                      {log.tipo}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${log.status === 'SUCCESS' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {log.status === 'SUCCESS' ? '✅ Éxito' : '❌ Fallo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-gray-50/50 border-t flex justify-end">
         <button 
           onClick={fetchLogs}
           className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
         >
           <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
           </svg>
           Actualizar
         </button>
      </div>
    </div>
  )
}
