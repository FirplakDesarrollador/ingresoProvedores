'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { aprobarContabilidad } from './actions'

function SubirSapButton({ proveedorId }: { proveedorId: string }) {
    const [loading, setLoading] = useState(false)

    const handleUpload = async () => {
        setLoading(true)
        try {
            const result = await aprobarContabilidad(proveedorId, {})
            if (result.success) {
                alert('✅ Enviado a SAP con éxito.')
            } else {
                alert('❌ Error: ' + result.error)
            }
        } catch (error: any) {
            alert('❌ Error: ' + (error.message || 'Desconocido'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleUpload}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md uppercase tracking-wider disabled:opacity-50 whitespace-nowrap"
        >
            {loading ? 'Subiendo...' : 'Subir a SAP'}
        </button>
    )
}

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
    estado_contabilidad?: string
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState<number | 'all'>(20)

    // Scroll synchronization refs
    const tableScrollRef = useRef<HTMLDivElement>(null)
    const topScrollRef = useRef<HTMLDivElement>(null)
    const [tableScrollWidth, setTableScrollWidth] = useState(0)
    const [canScrollHorizontally, setCanScrollHorizontally] = useState(false)

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, typeFilter, dateFrom, dateSort, pageSize])

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

    // Pagination calculations
    const totalItems = filteredProveedores.length
    const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize))

    const paginatedProveedores = useMemo(() => {
        if (pageSize === 'all') return filteredProveedores
        const start = (currentPage - 1) * pageSize
        return filteredProveedores.slice(start, start + pageSize)
    }, [filteredProveedores, currentPage, pageSize])

    const startItem = totalItems === 0 ? 0 : pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1
    const endItem = pageSize === 'all' ? totalItems : Math.min(currentPage * pageSize, totalItems)

    // Check overflow to display top horizontal scrollbar
    useEffect(() => {
        const checkOverflow = () => {
            if (tableScrollRef.current) {
                const { scrollWidth, clientWidth } = tableScrollRef.current
                setTableScrollWidth(scrollWidth)
                setCanScrollHorizontally(scrollWidth > clientWidth + 2)
            }
        }
        checkOverflow()
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [paginatedProveedores])

    const handleTopScroll = () => {
        if (topScrollRef.current && tableScrollRef.current) {
            tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
        }
    }

    const handleTableScroll = () => {
        if (topScrollRef.current && tableScrollRef.current) {
            topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft
        }
    }

    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(clamped)
        tableScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
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

            {/* Table Container Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Synchronized Top Horizontal Scrollbar (shown only when table overflows) */}
                {canScrollHorizontally && (
                    <div className="bg-gray-50/90 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-xs text-gray-500 select-none">
                        <span className="flex items-center gap-1.5 font-medium text-gray-500">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Desplazamiento horizontal:
                        </span>
                        <div
                            ref={topScrollRef}
                            onScroll={handleTopScroll}
                            className="flex-1 ml-3 overflow-x-auto overflow-y-hidden"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            <div style={{ width: `${tableScrollWidth}px`, height: '8px' }} />
                        </div>
                    </div>
                )}

                {/* Main Table Scroll Container */}
                <div
                    ref={tableScrollRef}
                    onScroll={handleTableScroll}
                    className="overflow-x-auto relative"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Tipo</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Nombre / Razón Social</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Identificación</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Email</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap sticky right-0 bg-gray-50 z-20 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {paginatedProveedores.map((p) => {
                                const fullName = p.tipo_contraparte === 'persona_natural'
                                    ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.trim() || '-'
                                    : p.razon_social || '-'
                                const email = p.email || p.correo_facturacion || '-'

                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                                                p.tipo_contraparte === 'empleado' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                p.tipo_contraparte === 'contado' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                p.tipo_contraparte === 'persona_natural'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                }`}>
                                                {p.tipo_contraparte === 'empleado' ? '👤 Empleado' : p.tipo_contraparte === 'contado' ? '💵 Contado' : p.tipo_contraparte === 'persona_natural' ? '👤 Natural' : '🏢 Jurídica'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-[#254153] max-w-[220px] truncate" title={fullName}>
                                            {fullName}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                                            {p.numero_identificacion || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm italic max-w-[200px] truncate" title={email}>
                                            {email}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {(p.tipo_contraparte === 'empleado' || p.tipo_contraparte === 'contado') ? (
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                                                    p.estado_contabilidad === 'aprobado' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {p.estado_contabilidad === 'aprobado' ? 'SUBIDO A SAP' : 'NO SUBIDO A SAP'}
                                                </span>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                                                    p.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    p.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {p.estado}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
                                            {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                                            <div className="flex justify-end gap-2 items-center">
                                                {(p.tipo_contraparte === 'empleado' || p.tipo_contraparte === 'contado') && p.estado_contabilidad !== 'aprobado' && (
                                                    <SubirSapButton proveedorId={p.id} />
                                                )}
                                                <Link
                                                    href={`/proveedores/${p.id}`}
                                                    className="inline-flex items-center px-3.5 py-1.5 bg-[#254153] text-white text-xs font-bold rounded-lg hover:bg-[#1a2e3a] transition-all shadow-sm hover:shadow-md uppercase tracking-wider whitespace-nowrap"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {paginatedProveedores.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 italic">
                                        No se encontraron proveedores con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination & Summary Footer */}
                {totalItems > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
                        {/* Summary */}
                        <div className="font-medium">
                            Mostrando <span className="font-bold text-[#254153]">{startItem}</span> a <span className="font-bold text-[#254153]">{endItem}</span> de <span className="font-bold text-[#254153]">{totalItems}</span> registros
                        </div>

                        {/* Page navigation buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                title="Primera página"
                            >
                                «
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                title="Página anterior"
                            >
                                ‹ Anterior
                            </button>

                            <span className="px-3 py-1 font-semibold text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                title="Página siguiente"
                            >
                                Siguiente ›
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                title="Última página"
                            >
                                »
                            </button>
                        </div>

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Filas por página:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setPageSize(val === 'all' ? 'all' : Number(val))
                                }}
                                className="px-2 py-1 border border-gray-200 rounded-md bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#254153]"
                            >
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">Todas</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
