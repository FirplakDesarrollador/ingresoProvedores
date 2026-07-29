import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProveedoresTable from '../proveedores/ProveedoresTable'
import CopyLinkButton from '../dashboard/CopyLinkButton'

export default async function ProveedoresContadoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Separate COUNT queries to get real totals (Supabase caps rows at 1000)
    const [
        { count: total },
        { count: pendientes },
        { count: aprobados },
        { count: rechazados },
        { data: proveedores }
    ] = await Promise.all([
        supabase.from('proveedores').select('*', { count: 'exact', head: true })
            .in('estado', ['pendiente', 'aprobado', 'rechazado'])
            .eq('tipo_contraparte', 'contado'),
        supabase.from('proveedores').select('*', { count: 'exact', head: true })
            .eq('estado', 'pendiente')
            .eq('tipo_contraparte', 'contado'),
        supabase.from('proveedores').select('*', { count: 'exact', head: true })
            .eq('estado', 'aprobado')
            .eq('tipo_contraparte', 'contado'),
        supabase.from('proveedores').select('*', { count: 'exact', head: true })
            .eq('estado', 'rechazado')
            .eq('tipo_contraparte', 'contado'),
        supabase.from('proveedores').select('*')
            .in('estado', ['pendiente', 'aprobado', 'rechazado'])
            .eq('tipo_contraparte', 'contado')
            .order('created_at', { ascending: false })
            .limit(500),
    ])

    const stats = {
        total:      total      || 0,
        pendientes: pendientes || 0,
        aprobados:  aprobados  || 0,
        rechazados: rechazados || 0,
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1E3A5F]">Proveedores de Contado</h1>
                    <p className="text-gray-500 mt-1">Gestión de proveedores de contado registrados en el sistema.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-xl font-bold mb-2 text-[#254153]">Registro de Proveedores de Contado</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-md">Enlace exclusivo para que los proveedores de contado completen su registro inicial en el sistema.</p>
                    <CopyLinkButton path="/registro?tipo=contado" />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Registrados</p>
                            <p className="text-3xl font-bold text-[#1E3A5F]">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-sm font-medium text-amber-600 mb-1">Pendientes</p>
                            <p className="text-3xl font-bold text-[#1E3A5F]">{stats.pendientes}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-sm font-medium text-emerald-600 mb-1">Aprobados</p>
                            <p className="text-3xl font-bold text-[#1E3A5F]">{stats.aprobados}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Rechazados</p>
                            <p className="text-3xl font-bold text-[#1E3A5F]">{stats.rechazados}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <ProveedoresTable initialData={proveedores} />
                </div>
            </main>
        </div>
    )
}
