'use client'

import { useState } from 'react'
import { reenviarCertificacionBancaria } from './actions'

interface Props {
    proveedorId: string
    variant?: 'table' | 'detail'
    className?: string
}

export default function ReenviarCertificadoButton({ proveedorId, variant = 'table', className = '' }: Props) {
    const [loading, setLoading] = useState(false)

    const handleReenviar = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('¿Deseas reenviar la certificación bancaria de este proveedor?')) return

        setLoading(true)
        try {
            const result = await reenviarCertificacionBancaria(proveedorId)
            if (result.success) {
                alert('✅ ' + (result.message || 'Certificación bancaria reenviada con éxito.'))
            } else {
                alert('❌ ' + (result.error || 'Error al reenviar la certificación.'))
            }
        } catch (error: any) {
            alert('❌ Error: ' + (error.message || 'Error inesperado al conectar con el servidor.'))
        } finally {
            setLoading(false)
        }
    }

    if (variant === 'detail') {
        return (
            <button
                type="button"
                onClick={handleReenviar}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                title="Reenviar Certificación Bancaria a Power Automate"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Reenviando...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Reenviar Certificación Bancaria</span>
                    </>
                )}
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={handleReenviar}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${className}`}
            title="Reenviar Certificación Bancaria al flujo"
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-3.5 w-3.5 text-blue-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Reenviando...</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Reenviar Certificación Bancaria</span>
                </>
            )}
        </button>
    )
}
