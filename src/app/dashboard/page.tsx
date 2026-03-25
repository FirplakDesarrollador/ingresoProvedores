import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'
import CopyLinkButton from './CopyLinkButton'
import ProveedoresTable from './ProveedoresTable'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Obtener proveedores
    const { data: proveedores } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false })

    const stats = {
        total: proveedores?.length || 0,
        pendientes: proveedores?.filter(p => p.estado === 'pendiente').length || 0,
        aprobados: proveedores?.filter(p => p.estado === 'aprobado').length || 0,
        rechazados: proveedores?.filter(p => p.estado === 'rechazado').length || 0,
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#254153] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold">Gestión de Proveedores</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-white/70 text-sm">{user.email}</span>
                            <form action={logout}>
                                <button type="submit" className="px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition">
                                    Cerrar sesión
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Registro de Proveedores */}
                    <div className="bg-[#254153] rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Enlace de Registro de Proveedores</h2>
                                <p className="text-white/70 text-sm">Comparte este enlace con tus proveedores</p>
                            </div>
                            <CopyLinkButton />
                        </div>
                    </div>

                    {/* Registro de Empleados */}
                    <div className="bg-[#254153] rounded-2xl p-6 text-white border-2 border-white/10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Enlace de Registro de Empleados</h2>
                                <p className="text-white/70 text-sm">Comparte este enlace con tus empleados</p>
                            </div>
                            <CopyLinkButton path="/registro?tipo=empleado" />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'bg-[#254153]' },
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

                {/* Tabla con filtros */}
                <ProveedoresTable proveedores={proveedores || []} />
            </main>
        </div>
    )
}
