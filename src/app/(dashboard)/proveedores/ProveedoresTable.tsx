'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Proveedor {
    id: string
    tipo_contraparte: string
    primer_nombre?: string
    primer_apellido?: string
    razon_social?: string
    numero_identificacion?: string
    email?: string
    correo_facturacion?: string
    estado: string
    created_at: string
}

interface ProveedoresTableProps {
    initialData: Proveedor[] | null
}

export default function ProveedoresTable({ initialData }: ProveedoresTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [typeFilter, setTypeFilter] = useState('todos')
    const [dateFrom, setDateFrom] = useState('')
    const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc')

    const filteredProveedores = useMemo(() => {
        if (!initialData) return []

        return initialData
            .filter(p => {
                // Search term (Name, Email, ID)
                const name = (p.tipo_contraparte === 'persona_natural'
                    ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`
                    : p.razon_social || '').toLowerCase()
                const email = (p.email || p.correo_facturacion || '').toLowerCase()
                const id = (p.numero_identificacion || '').toLowerCase()
                const searchMatch = name.includes(searchTerm.toLowerCase()) ||
                    email.includes(searchTerm.toLowerCase()) ||
                    id.includes(searchTerm.toLowerCase())

                // Status filter
                const statusMatch = statusFilter === 'todos' || p.estado === statusFilter

                // Type filter
                const typeMatch = typeFilter === 'todos' || p.tipo_contraparte === typeFilter

                // Date filter
                let dateMatch = true
                if (dateFrom) {
                    const registerDate = new Date(p.created_at).getTime()
                    const filterDate = new Date(dateFrom).getTime()
                    dateMatch = registerDate >= filterDate
                }

                return searchMatch && statusMatch && typeMatch && dateMatch
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()
                return dateSort === 'desc' ? dateB - dateA : dateA - dateB
            })
    }, [initialData, searchTerm, statusFilter, typeFilter, dateFrom, dateSort])

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Buscar</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Nombre, email o ID..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-40">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Estado</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all sm:text-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>

                <div className="w-40">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Tipo</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all sm:text-sm bg-white"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="persona_natural">Natural</option>
                        <option value="persona_juridica">Jurídica</option>
                    </select>
                </div>

                <div className="w-40">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Desde fecha</label>
                    <input
                        type="date"
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all sm:text-sm bg-white"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                <div className="w-40">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Ordenar por</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153] focus:border-transparent transition-all sm:text-sm bg-white"
                        value={dateSort}
                        onChange={(e) => setDateSort(e.target.value as 'desc' | 'asc')}
                    >
                        <option value="desc">Más recientes</option>
                        <option value="asc">Más antiguos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tipo</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nombre/Razón Social</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Identificación</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProveedores.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${p.tipo_contraparte === 'persona_natural'
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            }`}>
                                            {p.tipo_contraparte === 'persona_natural' ? '👤 Natural' : '🏢 Jurídica'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#254153] max-w-xs truncate">
                                        {p.tipo_contraparte === 'persona_natural'
                                            ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.trim() || '-'
                                            : p.razon_social || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-medium">{p.numero_identificacion || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-sm italic">{p.email || p.correo_facturacion || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${p.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                p.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-sm">
                                        {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/proveedores/${p.id}`}
                                            className="inline-flex items-center px-4 py-1.5 bg-[#254153] text-white text-xs font-bold rounded-lg hover:bg-[#1a2e3a] transition-all shadow-sm hover:shadow-md uppercase tracking-wider"
                                        >
                                            Ver detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredProveedores.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 italic">
                                        No se encontraron proveedores con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
