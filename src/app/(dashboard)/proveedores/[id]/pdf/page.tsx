import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PdfClient from './PdfClient'

export default async function PDFProveedorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: proveedor, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single()

    // Obtener la firma si existe
    const { data: firmaDoc } = await supabase
        .from('proveedor_documentos')
        .select('file_path')
        .eq('proveedor_id', id)
        .eq('tipo_documento', 'FIRMA')
        .maybeSingle()

    let firma_url = null
    if (firmaDoc) {
        const { data: { publicUrl } } = supabase.storage
            .from('proveedores')
            .getPublicUrl(firmaDoc.file_path)
        firma_url = publicUrl
    }

    if (error || !proveedor) {
        return notFound()
    }

    return <PdfClient proveedor={{ ...proveedor, firma_url }} />
}
