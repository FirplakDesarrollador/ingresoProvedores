import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PdfClient from './PdfClient'

export default async function PDFProveedorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Obtener datos del proveedor
    const { data: proveedor, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !proveedor) {
        return notFound()
    }

    // 2. Obtener TODOS los documentos del proveedor
    const { data: documentos } = await supabase
        .from('proveedor_documentos')
        .select('tipo_documento, file_path')
        .eq('proveedor_id', id)

    // 3. Generar URLs públicas para documentos (especialmente la firma)
    let firma_url = null
    const docLabels: string[] = []

    if (documentos) {
        documentos.forEach(doc => {
            docLabels.push(doc.tipo_documento)
            
            if (doc.tipo_documento === 'FIRMA') {
                const { data: { publicUrl } } = supabase.storage
                    .from('proveedores')
                    .getPublicUrl(doc.file_path)
                firma_url = publicUrl
            }
        })
    }

    return <PdfClient proveedor={{ ...proveedor, firma_url, documentos_subidos: docLabels }} />
}
