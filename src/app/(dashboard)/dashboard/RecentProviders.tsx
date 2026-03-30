'use client'

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

export default function RecentProviders({ proveedores }: Props) {
    const recent = proveedores.slice(0, 5)

    if (recent.length === 0) return null

    return (
        <div className="bg-white p-6 rounded-2xl border shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-[#254153]">Proveedores Recientes</h3>
                <Link 
                    href="/proveedores" 
                    className="text-sm font-medium text-[#254153] hover:underline"
                >
                    Ver todos →
                </Link>
            </div>

            <div className="space-y-6">
                {recent.map((p) => {
                    const nombre = p.tipo_contraparte === 'persona_natural'
                        ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}`.trim() || '-'
                        : p.razon_social || '-'
                    
                    const initials = p.tipo_contraparte === 'persona_natural' 
                        ? `${(p.primer_nombre?.[0] || '')}${(p.primer_apellido?.[0] || '')}`
                        : (p.razon_social?.[0] || '')

                    return (
                        <div key={p.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    p.tipo_contraparte === 'persona_natural' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                } group-hover:scale-110 transition-transform duration-200`}>
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#254153] line-clamp-1">{nombre}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Registrado el {new Date(p.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    p.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                    p.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {p.estado}
                                </span>
                                <Link 
                                    href={`/proveedores/${p.id}`} 
                                    className="text-[10px] text-gray-400 hover:text-[#254153] font-bold"
                                >
                                    DETALLES
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Empty state visual footer */}
            <div className="mt-10 p-4 border-2 border-dashed border-gray-50 rounded-xl bg-gray-50/30 text-center">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿Necesitas un nuevo registro?</p>
                <div className="flex justify-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-300" />
                </div>
            </div>
        </div>
    )
}
