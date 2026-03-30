'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { aprobarProveedor, rechazarProveedor } from '../actions'

interface Props {
    proveedorId: string
    estadoActual: string
}

export default function AccionesProveedor({ proveedorId, estadoActual }: Props) {
    const router = useRouter()
    const [showAprobar, setShowAprobar] = useState(false)
    const [showRechazar, setShowRechazar] = useState(false)
    const [fechaVigencia, setFechaVigencia] = useState('')
    const [motivoRechazo, setMotivoRechazo] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAprobar = async () => {
        if (!fechaVigencia) return alert('Selecciona una fecha de vigencia')
        setLoading(true)
        const result = await aprobarProveedor(proveedorId, fechaVigencia)
        setLoading(false)
        if (result.success) {
            setShowAprobar(false)
            router.refresh()
        } else {
            alert('Error: ' + result.error)
        }
    }

    const handleRechazar = async () => {
        if (!motivoRechazo.trim()) return alert('Ingresa el motivo del rechazo')
        setLoading(true)
        const result = await rechazarProveedor(proveedorId, motivoRechazo)
        setLoading(false)
        if (result.success) {
            setShowRechazar(false)
            router.refresh()
        } else {
            alert('Error: ' + result.error)
        }
    }

    return (
        <div className="space-y-4">
            {/* Botón de PDF siempre visible */}
            <div className="mb-6">
                <Link
                    href={`/proveedores/${proveedorId}/pdf`}
                    target="_blank"
                    className="w-full py-4 bg-white text-[#254153] border-2 border-[#254153] font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Previsualizar / Descargar Formulario PDF
                </Link>
                <p className="text-xs text-gray-400 mt-2 text-center italic">
                    Este documento genera el formato oficial de conocimiento de contrapartes para impresión.
                </p>
            </div>

            {estadoActual !== 'pendiente' ? (
                <div className={`p-4 rounded-xl ${estadoActual === 'aprobado' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                    }`}>
                    <p className={`font-medium ${estadoActual === 'aprobado' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {estadoActual === 'aprobado' ? '✅ Proveedor Aprobado' : '❌ Proveedor Rechazado'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setShowAprobar(true); setShowRechazar(false) }}
                            className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition"
                        >
                            ✅ Aprobar Proveedor
                        </button>
                        <button
                            onClick={() => { setShowRechazar(true); setShowAprobar(false) }}
                            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
                        >
                            ❌ Rechazar Proveedor
                        </button>
                    </div>

                    {/* Modal Aprobar */}
                    {showAprobar && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <h3 className="font-semibold text-emerald-700 mb-3">Aprobar Proveedor</h3>
                            <label className="block text-sm text-gray-700 mb-2">Fecha de vigencia de la aprobación:</label>
                            <input
                                type="date"
                                value={fechaVigencia}
                                onChange={(e) => setFechaVigencia(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border rounded-lg mb-3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAprobar}
                                    disabled={loading}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Confirmar Aprobación'}
                                </button>
                                <button onClick={() => setShowAprobar(false)} className="px-4 py-2 border rounded-lg">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modal Rechazar */}
                    {showRechazar && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h3 className="font-semibold text-red-700 mb-3">Rechazar Proveedor</h3>
                            <label className="block text-sm text-gray-700 mb-2">Motivo del rechazo:</label>
                            <textarea
                                value={motivoRechazo}
                                onChange={(e) => setMotivoRechazo(e.target.value)}
                                placeholder="Explica por qué se rechaza este proveedor..."
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg mb-3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRechazar}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Confirmar Rechazo'}
                                </button>
                                <button onClick={() => setShowRechazar(false)} className="px-4 py-2 border rounded-lg">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
