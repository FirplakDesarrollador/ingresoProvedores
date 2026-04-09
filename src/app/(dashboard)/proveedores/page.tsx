import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProveedoresPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: proveedores } = await supabase
        .from('proveedores')
        .select('*')
        .in('estado', ['pendiente', 'aprobado', 'rechazado'])
        .order('created_at', { ascending: false })

    const stats = {
        total: proveedores?.length || 0,
        pendientes: proveedores?.filter(p => p.estado === 'pendiente').length || 0,
        aprobados: proveedores?.filter(p => p.estado === 'aprobado').length || 0,
        rechazados: proveedores?.filter(p => p.estado === 'rechazado').length || 0,
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}


            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-gray-500' },
                        { label: 'Pendientes', value: stats.pendientes, color: 'bg-amber-500' },
                        { label: 'Aprobados', value: stats.aprobados, color: 'bg-emerald-500' },
                        { label: 'Rechazados', value: stats.rechazados, color: 'bg-red-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border shadow-sm">
                            <div className={`w-3 h-3 rounded-full ${s.color} mb-2`}></div>
                            <p className="text-2xl font-bold text-[#254153]">{s.value}</p>
                            <p className="text-gray-500 text-sm">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
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
                        <tbody>
                            {proveedores?.map((p) => (
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
                                    <td className="px-4 py-3 text-gray-600">{p.numero_identificacion || '-'}</td>
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
                                            Ver detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!proveedores || proveedores.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No hay proveedores registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
