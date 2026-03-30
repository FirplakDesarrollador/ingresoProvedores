'use client'

export default function PrintButton() {
    return (
        <div className="mt-8 flex justify-center gap-4 print:hidden">
            <button 
                onClick={() => window.print()}
                className="bg-[#254153] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#1a2e3b] transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m4 3H9" />
                </svg>
                Imprimir / Guardar como PDF
            </button>
        </div>
    )
}
