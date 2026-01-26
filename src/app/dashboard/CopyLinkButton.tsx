'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
    baseUrl?: string
}

export default function CopyLinkButton({ baseUrl }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const url = (baseUrl || window.location.origin) + '/registro'
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#254153] font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
        >
            {copied ? (
                <>
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Copiado!
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar enlace
                </>
            )}
        </button>
    )
}
