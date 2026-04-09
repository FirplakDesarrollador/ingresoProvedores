'use client'

import { useState } from 'react'

interface Documento {
    id: string
    tipo_documento: string
    nombre_archivo: string
    file_path: string
    mime_type: string
}

interface Props {
    documentos: Documento[]
    supabaseUrl: string
}

export default function DocumentosList({ documentos, supabaseUrl }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewType, setPreviewType] = useState<string | null>(null)

    const getFullUrl = (filePath: string) => {
        return `${supabaseUrl}/storage/v1/object/public/proveedores/${filePath}`
    }

    const handlePreview = (doc: Documento) => {
        setPreviewUrl(getFullUrl(doc.file_path))
        setPreviewType(doc.mime_type)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentos.map((doc) => (
                    <div key={doc.id} className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Thumbnail / Icon Area */}
                        <div 
                            onClick={() => handlePreview(doc)}
                            className="h-40 bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden relative"
                        >
                            {doc.mime_type?.includes('image') ? (
                                <img 
                                    src={getFullUrl(doc.file_path)} 
                                    alt={doc.nombre_archivo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Documento PDF</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#254153] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    VER DOC
                                </span>
                            </div>
                        </div>

                        {/* Info & Actions Area */}
                        <div className="p-3 border-t">
                            <div className="mb-3">
                                <h4 className="text-xs font-bold text-[#254153] uppercase truncate">{doc.tipo_documento}</h4>
                                <p className="text-[10px] text-gray-500 truncate">{doc.nombre_archivo}</p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePreview(doc)}
                                    className="flex-1 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1"
                                >
                                    Visualizar
                                </button>
                                <a
                                    href={getFullUrl(doc.file_path)}
                                    download={doc.nombre_archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-1.5 bg-white text-[#254153] text-[10px] font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                >
                                    Descargar
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 text-[#254153]">
                            <h3 className="font-bold">Vista Previa de Documento</h3>
                            <button 
                                onClick={() => { setPreviewUrl(null); setPreviewType(null); }}
                                className="p-2 hover:bg-gray-200 rounded-full transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
                            {previewType?.includes('pdf') ? (
                                <iframe 
                                    src={`${previewUrl}#toolbar=0`} 
                                    className="w-full h-full rounded-lg border shadow-lg"
                                />
                            ) : (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
