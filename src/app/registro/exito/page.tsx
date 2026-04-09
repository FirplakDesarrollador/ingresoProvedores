'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PdfClient from '../pdf/[id]/PdfClient'
import { uploadDocument } from '../actions'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function ExitoContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [proveedor, setProveedor] = useState<any>(null)
    const [uploadingPdf, setUploadingPdf] = useState(false)
    const [pdfUploaded, setPdfUploaded] = useState(false)
    const pdfRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // 1. Cargar datos del proveedor para generar el PDF físico
    useEffect(() => {
        if (!id) return
        
        async function loadData() {
            // Cargar datos básicos
            const { data: pData } = await supabase
                .from('proveedores')
                .select('*')
                .eq('id', id)
                .single()
            
            if (!pData) return

            // Cargar documentos para el checklist
            const { data: dData } = await supabase
                .from('proveedor_documentos')
                .select('*')
                .eq('proveedor_id', id)
            
            let firmaUrl = null
            const docLabels = dData?.map(doc => {
                if (doc.tipo_documento === 'FIRMA') {
                    const { data: { publicUrl } } = supabase.storage
                        .from('proveedores')
                        .getPublicUrl(doc.file_path)
                    firmaUrl = publicUrl
                }
                return doc.tipo_documento
            }) || []

            setProveedor({ ...pData, firma_url: firmaUrl, documentos_subidos: docLabels })
        }

        loadData()
    }, [id])

    // 2. Capturar y subir el PDF al bucket automáticamente
    useEffect(() => {
        if (proveedor && pdfRef.current && !pdfUploaded && !uploadingPdf) {
            handleAutoUpload()
        }
        
        async function handleAutoUpload() {
            try {
                setUploadingPdf(true)
                // Esperar un poco a que las imágenes (firma) carguen
                await new Promise(r => setTimeout(r, 2000))

                const element = pdfRef.current
                if (!element) return

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                })

                const imgData = canvas.toDataURL('image/jpeg', 0.95)
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                })

                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
                const pdfBlob = pdf.output('blob')
                
                const file = new File([pdfBlob], `FORMULARIO_REGISTRO_${id}.pdf`, { type: 'application/pdf' })
                
                const formData = new FormData()
                formData.append('file', file)
                formData.append('proveedorId', id!)
                formData.append('tipoDocumento', 'FORMULARIO_FINAL')

                const res = await uploadDocument(formData)
                if (res.success) {
                    console.log('PDF guardado en el bucket correctamente')
                    setPdfUploaded(true)
                }
            } catch (err) {
                console.error('Error auto-guardando PDF:', err)
            } finally {
                setUploadingPdf(false)
            }
        }
    }, [proveedor])

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            {/* Contenedor Oculto para Generación de PDF */}
            <div className="fixed overflow-hidden h-0 w-0 opacity-0 pointer-events-none">
                <div ref={pdfRef} className="w-[210mm] bg-white">
                    {proveedor && <PdfClient proveedor={proveedor} />}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 scale-in-center">
                <div className="flex flex-col md:flex-row">
                    {/* Panel Izquierdo: Mensaje */}
                    <div className="md:w-1/3 p-8 bg-gray-50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h1 className="text-2xl font-black text-[#254153] mb-4 tracking-tight">¡Registro Exitoso!</h1>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Tu información ha sido recibida y el formulario final se ha guardado en nuestro sistema.
                        </p>

                        {uploadingPdf && (
                            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] text-blue-700 font-bold uppercase">Respaldando PDF en el servidor...</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            {id && (
                                <a
                                    href={`/registro/pdf/${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#254153] text-white rounded-xl font-bold shadow-lg shadow-[#254153]/20 hover:scale-[1.02] transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar PDF
                                </a>
                            )}

                            <Link
                                href="/registro"
                                className="w-full flex items-center justify-center px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Nuevo Registro
                            </Link>
                        </div>
                    </div>

                    {/* Panel Derecho: Previsualización PDF */}
                    <div className="md:w-2/3 bg-gray-200 p-4 md:p-8 min-h-[600px] flex items-center justify-center">
                        {id ? (
                            <div className="w-full h-full min-h-[700px] bg-white shadow-2xl rounded-lg overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#254153]"></div>
                                <iframe 
                                    src={`/registro/pdf/${id}`} 
                                    className="w-full h-full border-none"
                                    title="Previsualización de Formulario"
                                />
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/20">
                                <div className="text-4xl mb-4">📄</div>
                                <p className="text-gray-500 font-medium">El PDF no pudo generarse automáticamente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ExitoPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-[#254153] font-bold">Cargando...</div>}>
                <ExitoContent />
            </Suspense>
        </div>
    )
}
