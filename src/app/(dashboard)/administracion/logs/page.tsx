import LogsTable from '@/components/admin/LogsTable'
import Link from 'next/link'

export default function LogsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link 
                    href="/administracion" 
                    className="p-2.5 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 rounded-xl transition-all text-[#254153]"
                    title="Volver a Administración"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#254153] tracking-tight">Registro de Auditoría</h1>
                    <nav className="flex text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                        <span className="hover:text-gray-600 transition-colors cursor-default">Administración</span>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-blue-600">Logs del Sistema</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-full">
                <LogsTable />
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-blue-900">Privacidad y Seguridad</p>
                    <p className="text-xs text-blue-700/80 leading-relaxed mt-0.5">
                        Esta sección es de acceso restringido. Todos los registros son inmutables y sirven como evidencia legal de las operaciones realizadas en la plataforma.
                    </p>
                </div>
            </div>
        </div>
    )
}
