import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProveedoresTable from './ProveedoresTable'

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
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#254153]">Gestión de Proveedores</h1>
                    <p className="text-gray-500 text-sm">Administra y revisa las solicitudes de registro de proveedores.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Registros', value: stats.total, color: 'bg-gray-500', icon: '📊' },
                        { label: 'Pendientes', value: stats.pendientes, color: 'bg-amber-500', icon: '⏳' },
                        { label: 'Aprobados', value: stats.aprobados, color: 'bg-emerald-500', icon: '✅' },
                        { label: 'Rechazados', value: stats.rechazados, color: 'bg-red-500', icon: '❌' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
                                <span className="text-xl">{s.icon}</span>
                            </div>
                            <p className="text-3xl font-black text-[#254153] leading-none mb-1">{s.value}</p>
                            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filterable Table */}
                <ProveedoresTable initialData={proveedores} />
            </main>
        </div>
    )
}
