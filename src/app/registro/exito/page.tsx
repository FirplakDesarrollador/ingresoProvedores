import Link from 'next/link'

export default function ExitoPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#254153] mb-4">¡Registro Exitoso!</h1>
                <p className="text-gray-600 mb-6">
                    Tu información ha sido enviada correctamente. Nuestro equipo revisará tu solicitud y te contactará pronto.
                </p>
                <Link
                    href="/registro"
                    className="inline-block px-6 py-3 bg-[#254153] text-white rounded-xl font-semibold hover:bg-[#1a2e3a] transition"
                >
                    Realizar otro registro
                </Link>
            </div>
        </div>
    )
}
