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

    if (error || !proveedor) {
        return notFound()
    }

    return <PdfClient proveedor={proveedor} />
}
