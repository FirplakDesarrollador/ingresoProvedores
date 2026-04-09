import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CopyLinkButton from './CopyLinkButton'
import StatusDistribution from './StatusDistribution'
import RecentProviders from './RecentProviders'

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
        .in('estado', ['pendiente', 'aprobado', 'rechazado'])
        .order('created_at', { ascending: false })

    const stats = {
        total: proveedores?.length || 0,
        pendientes: proveedores?.filter(p => p.estado === 'pendiente').length || 0,
        aprobados: proveedores?.filter(p => p.estado === 'aprobado').length || 0,
        rechazados: proveedores?.filter(p => p.estado === 'rechazado').length || 0,
    }

    return (
        <div className="space-y-8">
            {/* Header / Intro */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-[#254153]">Bienvenida</h1>
                <p className="text-sm text-gray-500 font-medium italic">Gestión integral de registro y aprobación de proveedores Firplak.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status distribution section */}
                <StatusDistribution stats={stats} />
                
                {/* Recent activity summary */}
                <RecentProviders proveedores={proveedores || []} />
            </div>

            {/* Quick Actions / Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registro de Proveedores */}
                <div className="bg-[#254153] rounded-2xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Enlace de Registro de Proveedores</h2>
                        <p className="text-white/70 text-sm mb-6 max-w-xs">Usa este enlace para que tus proveedores externos completen su registro inicial en el sistema.</p>
                        <CopyLinkButton />
                    </div>
                </div>

                {/* Registro de Empleados */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-[#254153] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-[#254153]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-[#254153]">Registro de Empleados</h2>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">Enlace exclusivo para la base interna de colaboradores Firplak.</p>
                        <CopyLinkButton path="/registro?tipo=empleado" />
                    </div>
                </div>
            </div>
            
            <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/20 text-center">
                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Administración Central Firplak</p>
                <div className="flex justify-center flex-wrap gap-8 items-center opacity-40 grayscale">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-400" />
                        <span className="text-[10px] font-bold">SEGURIDAD ISO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-400" />
                        <span className="text-[10px] font-bold">AUDITORÍA ACTIVA</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-400" />
                        <span className="text-[10px] font-bold">CONTROL INTERNO</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

