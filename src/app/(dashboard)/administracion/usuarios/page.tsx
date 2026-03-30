import UsersTable from '@/components/admin/UsersTable'
import Link from 'next/link'

export default function UsuariosPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-6">
                <Link 
                    href="/administracion" 
                    className="group p-3 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 rounded-2xl transition-all text-[#254153]"
                    title="Volver a Administración"
                >
                    <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-[#254153] tracking-tight">Gestión de Cuentas</h1>
                    <nav className="flex text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-widest leading-none">
                        <span className="hover:text-gray-600 transition-colors cursor-default">Panel Administrativo</span>
                        <span className="mx-2 text-gray-200">/</span>
                        <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Control de Usuarios</span>
                    </nav>
                </div>
            </div>

            <UsersTable />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8 flex gap-6 items-start shadow-sm">
                    <div className="p-4 bg-amber-100/50 rounded-2xl text-amber-600 shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-amber-900 leading-tight">Seguridad de Acceso</p>
                        <p className="text-sm text-amber-800/70 leading-relaxed mt-2">
                            Las contraseñas están ocultas en el listado por privacidad. Puede actualizar la clave de cualquier usuario usando el botón de gestión, lo que registrará la acción en la bitácora del sistema.
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 flex gap-6 items-start shadow-sm">
                    <div className="p-4 bg-blue-100/50 rounded-2xl text-blue-600 shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-blue-900 leading-tight">Sincronización de Base de Datos</p>
                        <p className="text-sm text-blue-800/70 leading-relaxed mt-2">
                           Esta tabla refleja los usuarios registrados en la tabla pública. Los cambios se sincronizarán inmediatamente con la vista del administrador.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
