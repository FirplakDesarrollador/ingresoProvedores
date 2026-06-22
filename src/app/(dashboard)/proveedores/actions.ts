'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBankCertificateFlow } from '@/app/registro/actions'

export async function aprobarProveedor(id: string, fechaVigencia: string, pdfBase64?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('proveedores')
        .update({
            estado: 'aprobado',
            fecha_aprobacion: new Date().toISOString(),
            fecha_vigencia: fechaVigencia,
            aprobado_por: user?.id,
            fecha_decision: new Date().toISOString(),
            motivo_rechazo: null
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }
    
    // Obtener información del proveedor para la notificación
    const { data: prov } = await supabase
        .from('proveedores')
        .select('razon_social, primer_nombre, primer_apellido')
        .eq('id', id)
        .single()
        
    if (prov) {
        try {
            const nombreProveedor = prov.razon_social || `${prov.primer_nombre || ''} ${prov.primer_apellido || ''}`.trim()
            await sendApprovalNotification(nombreProveedor, pdfBase64)
            
            // Send Bank Certificate via Flow
            const { data: certDocs } = await supabase
                .from('proveedor_documentos')
                .select('file_path, nombre_archivo')
                .eq('proveedor_id', id)
                .ilike('tipo_documento', '%CERT%BANCARI%')
                .order('created_at', { ascending: false })
                .limit(1);

            if (certDocs && certDocs.length > 0 && certDocs[0].file_path) {
                const { data: fileData } = await supabase.storage.from('proveedores').download(certDocs[0].file_path);
                if (fileData) {
                    const arrayBuffer = await fileData.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const originalName = certDocs[0].nombre_archivo || 'Certificado.pdf';
                    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'pdf';
                    const finalFileName = `Certificado_Bancario_${nombreProveedor.replace(/\s+/g, '_')}.${ext}`;
                    await sendBankCertificateFlow(nombreProveedor, finalFileName, base64);
                }
            }
        } catch (emailError) {
            console.error('Error al enviar notificaciones de aprobación:', emailError)
        }
    }

    revalidatePath('/proveedores')
    revalidatePath(`/proveedores/${id}`)
    return { success: true }
}

export async function rechazarProveedor(id: string, motivo: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('proveedores')
        .update({
            estado: 'rechazado',
            motivo_rechazo: motivo,
            aprobado_por: user?.id,
            fecha_decision: new Date().toISOString(),
            fecha_aprobacion: null,
            fecha_vigencia: null
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/proveedores')
    revalidatePath(`/proveedores/${id}`)
    return { success: true }
}

async function sendApprovalNotification(nombreProveedor: string, pdfBase64?: string) {
    const flowUrl = process.env.FLOW_URL
    
    if (!flowUrl || flowUrl.includes('prod-XX.region.logic.azure.com')) {
        console.warn('FLOW_URL no configurado o es el valor por defecto. Saltando envío de notificación.')
        return
    }

    // Clean base64 prefix if exists
    let cleanPdfBase64 = pdfBase64;
    if (cleanPdfBase64 && cleanPdfBase64.includes('base64,')) {
        cleanPdfBase64 = cleanPdfBase64.split('base64,')[1];
    }

    const payload: any = {
        titulo: `Se ha aprobado el proveedor (${nombreProveedor})`,
        contenido: "El proveedor ha sido aprobado y la notificación ha sido procesada."
    }

    if (cleanPdfBase64) {
        payload.pdf = cleanPdfBase64;
    }

    try {
        const response = await fetch(flowUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error en el flow (${response.status}): ${errorText}`)
        }

        console.log('Notificación de aprobación enviada con éxito')
    } catch (error) {
        console.error('Error al llamar al flow de notificación:', error)
        throw error
    }
}
