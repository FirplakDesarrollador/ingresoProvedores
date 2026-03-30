'use client'

interface Props {
    stats: {
        total: number
        pendientes: number
        aprobados: number
        rechazados: number
    }
}

export default function StatusDistribution({ stats }: Props) {
    if (stats.total === 0) return null

    const segments = [
        { label: 'Aprobados', value: stats.aprobados, color: 'bg-emerald-500', text: 'text-emerald-600' },
        { label: 'Pendientes', value: stats.pendientes, color: 'bg-amber-500', text: 'text-amber-600' },
        { label: 'Rechazados', value: stats.rechazados, color: 'bg-red-500', text: 'text-red-600' },
    ]

    return (
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold text-[#254153] mb-6">Distribución de Estados</h3>
            
            {/* Chart bar */}
            <div className="flex w-full h-8 rounded-full overflow-hidden mb-8 bg-gray-100">
                {segments.map((s, i) => {
                    const width = (s.value / stats.total) * 100
                    if (width === 0) return null
                    return (
                        <div 
                            key={i} 
                            style={{ width: `${width}%` }} 
                            className={`${s.color} transition-all duration-500`}
                        />
                    )
                })}
            </div>

            {/* Legend with percentages */}
            <div className="space-y-4">
                {segments.map((s, i) => {
                    const percentage = Math.round((s.value / stats.total) * 100)
                    return (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                                <span className="text-sm font-medium text-gray-600">{s.label}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-[#254153]">{s.value}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-50 ${s.text}`}>
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Resumen General</p>
                <p className="text-2xl font-black text-[#254153] mt-1">{stats.total}</p>
                <p className="text-[10px] text-gray-400">Total Proveedores Registrados</p>
            </div>
        </div>
    )
}
