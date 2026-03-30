'use client'

import { useState } from 'react'
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

interface Props {
    proveedores: Proveedor[]
}

export default function ProveedoresTable({ proveedores }: Props) {
    const [filtroEstado, setFiltroEstado] = useState<string>('todos')
    const [busqueda, setBusqueda] = useState('')

    const proveedoresFiltrados = proveedores.filter(p => {
        // Filtro por estado
        if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
            return false
        }

        // Filtro por búsqueda
        if (busqueda.trim()) {
            const termino = busqueda.toLowerCase()
            const nombre = p.tipo_contraparte === 'persona_natural'
                ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.toLowerCase()
                : (p.razon_social || '').toLowerCase()
            const nit = (p.numero_identificacion || '').toLowerCase()

            if (!nombre.includes(termino) && !nit.includes(termino)) {
                return false
            }
        }

        return true
    })

    return (
        <div>
            {/* Filtros y Búsqueda */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Búsqueda */}
                <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o NIT..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#254153] focus:border-transparent text-gray-900"
                        />
                    </div>
                </div>

                {/* Filtros por estado */}
                <div className="flex gap-2">
                    {[
                        { value: 'todos', label: 'Todos', color: 'bg-gray-100 text-gray-700' },
                        { value: 'pendiente', label: 'Pendientes', color: 'bg-amber-100 text-amber-700' },
                        { value: 'aprobado', label: 'Aprobados', color: 'bg-emerald-100 text-emerald-700' },
                        { value: 'rechazado', label: 'Rechazados', color: 'bg-red-100 text-red-700' },
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFiltroEstado(f.value)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${filtroEstado === f.value
                                    ? f.value === 'todos'
                                        ? 'bg-[#254153] text-white'
                                        : f.color + ' ring-2 ring-offset-1 ring-current'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resultados */}
            <div className="mb-4 text-sm text-gray-500">
                Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tipo</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nombre/Razón Social</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">NIT/Identificación</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedoresFiltrados.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.tipo_contraparte === 'persona_natural'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {p.tipo_contraparte === 'persona_natural' ? '👤 Natural' : '🏢 Jurídica'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-[#254153]">
                                    {p.tipo_contraparte === 'persona_natural'
                                        ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.trim() || '-'
                                        : p.razon_social || '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-600 font-mono text-sm">{p.numero_identificacion || '-'}</td>
                                <td className="px-4 py-3 text-gray-600">{p.email || p.correo_facturacion || '-'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                            p.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {p.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-sm">
                                    {new Date(p.created_at).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/proveedores/${p.id}`}
                                        className="px-3 py-1 bg-[#254153] text-white text-sm rounded-lg hover:bg-[#1a2e3a]"
                                    >
                                        Ver
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {proveedoresFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="text-4xl mb-2">🔍</div>
                                    No se encontraron proveedores con los filtros aplicados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
