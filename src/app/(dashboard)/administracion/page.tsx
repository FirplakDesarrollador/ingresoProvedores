import Link from 'next/link'

export default function AdministracionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#254153]">Administración</h1>
                <p className="text-gray-500">Configuración general del sistema y gestión de usuarios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Usuarios', description: 'Gestionar accesos y permisos de usuarios.', icon: '👥', href: '/administracion/usuarios' },
                    { title: 'Configuración', description: 'Parámetros generales del sistema.', icon: '⚙️', href: '#' },
                    { title: 'Logs de Sistema', description: 'Registro de actividades y auditoría.', icon: '📋', href: '/administracion/logs' },
                ].map((item, i) => (
                    <Link 
                        key={i} 
                        href={item.href}
                        className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition cursor-pointer group hover:border-blue-200"
                    >
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h2 className="text-lg font-semibold text-[#254153] mb-2">{item.title}</h2>
                        <p className="text-sm text-gray-500">{item.description}</p>
                    </Link>
                ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
                <div className="flex gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-semibold">Sección en desarrollo</p>
                        <p className="text-sm opacity-90">Esta sección estará disponible próximamente con funcionalidades extendidas de administración.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
