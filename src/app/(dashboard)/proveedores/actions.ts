'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBankCertificateFlow } from '@/app/registro/actions'
import { createBusinessPartner, SapProveedorData } from '@/lib/sap'

export async function aprobarProveedor(id: string, fechaVigencia: string, pdfBase64?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Obtener información del proveedor para la notificación y SAP
    const { data: prov, error: fetchError } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single()
        
    if (fetchError || !prov) {
        return { success: false, error: 'Proveedor no encontrado' }
    }

    // --- 1. Aprobamos en base de datos (Cumplimiento) ---
    const { error: updateError } = await supabase
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

    if (updateError) {
        return { success: false, error: `Falló la actualización en la BD: ${updateError.message}` }
    }

    // --- 2. Flujos de Notificación y Certificados ---
        try {
            const nombreProveedor = prov.razon_social || `${prov.primer_nombre || ''} ${prov.primer_apellido || ''}`.trim()
            await sendApprovalNotification(nombreProveedor, pdfBase64)
            
            // Send Bank Certificate via Flow
            const { data: certDocs } = await supabase
                .from('proveedor_documentos')
                .select('file_path, nombre_archivo')
                .eq('proveedor_id', id)
                .or('tipo_documento.ilike.%CERT%BANCARI%,tipo_documento.ilike.%BANK%CERTIFICATION%')
                .order('created_at', { ascending: false })
                .limit(1);

            if (certDocs && certDocs.length > 0 && certDocs[0].file_path) {
                const filePath = certDocs[0].file_path;
                const { data: publicUrlData } = supabase.storage.from('proveedores').getPublicUrl(filePath);
                const archivoUrl = publicUrlData?.publicUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proveedores/${filePath}`;
                const originalName = certDocs[0].nombre_archivo || 'Certificado.pdf';
                const ext = originalName.includes('.') ? originalName.split('.').pop() : 'pdf';
                const finalFileName = `Certificado_Bancario_${nombreProveedor.replace(/\s+/g, '_')}.${ext}`;

                let base64 = '';
                try {
                    const { data: fileData } = await supabase.storage.from('proveedores').download(filePath);
                    if (fileData) {
                        const arrayBuffer = await fileData.arrayBuffer();
                        base64 = Buffer.from(arrayBuffer).toString('base64');
                    }
                } catch (dlErr) {
                    console.warn('No se pudo descargar certificado para base64:', dlErr);
                }

                await sendBankCertificateFlow(nombreProveedor, finalFileName, archivoUrl, base64);
            }
    } catch (emailError) {
        console.error('Error al enviar notificaciones de aprobación:', emailError)
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

const DEFAULT_FLOW_URL = 'https://8c18912a4169ec67aa9b39bdfb7cc3.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c159bf38d23f4ca7bf38dfece31fc064/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=m85rJk83hYTrBICvjA4Mt6eScBIVh1z_PAqo651q5wk'

async function sendApprovalNotification(nombreProveedor: string, pdfBase64?: string) {
    const flowUrl = process.env.FLOW_URL || DEFAULT_FLOW_URL
    
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
        titulo: `Proveedor Aprobado - ${nombreProveedor}`,
        contenido: "El proveedor ha sido aprobado y la notificación ha sido procesada.",
        nombreArchivo: "",
        pdf: ""
    }

    if (cleanPdfBase64) {
        payload.pdf = cleanPdfBase64;
        payload.nombreArchivo = `Aprobacion_${nombreProveedor.replace(/\s+/g, '_')}.pdf`;
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

export async function aprobarContabilidad(id: string, formData: any) {
    const supabase = await createClient()

    // Obtener información base del proveedor
    const { data: prov, error: fetchError } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single()
        
    if (fetchError || !prov) {
        return { success: false, error: 'Proveedor no encontrado' }
    }

    // Combinar los datos actuales con los nuevos datos de contabilidad
    const completeProvData = { ...prov, ...formData }

    // --- 1. Crear Socio de Negocios en SAP ---
    try {
        console.log(`Intentando crear BP en SAP para el proveedor ${id}...`)
        const sapResult = await createBusinessPartner(completeProvData as SapProveedorData)
        
        if (!sapResult.success) {
            console.error('El proveedor falló su creación en SAP:', sapResult.error)
            return { 
                success: false, 
                error: `Error al crear en SAP: ${sapResult.error}` 
            }
        }
    } catch (sapError: any) {
        console.error('Error no controlado al integrar con SAP:', sapError)
        return { 
            success: false, 
            error: `Error interno de conexión con SAP: ${sapError.message || sapError}` 
        }
    }

    // --- 2. Si SAP fue exitoso, guardamos los datos contables y el nuevo estado ---
    const updateData: any = {
        estado_contabilidad: 'aprobado',
        grupo_bp: formData.grupo_bp,
        cuenta_asociada: formData.cuenta_asociada,
        aplica_retenciones: formData.aplica_retenciones,
        sujeto_a_retencion: formData.sujeto_a_retencion,
        codigos_retencion: formData.codigos_retencion
    }

    if (prov.tipo_contraparte === 'empleado' || prov.tipo_contraparte === 'contado') {
        updateData.estado = 'aprobado'
        updateData.fecha_decision = new Date().toISOString()
    }

    const { error: updateError } = await supabase
        .from('proveedores')
        .update(updateData)
        .eq('id', id)

    if (updateError) {
        return { success: false, error: `Se creó en SAP pero falló al actualizar BD: ${updateError.message}` }
    }

    revalidatePath('/proveedores')
    revalidatePath(`/proveedores/${id}`)
    return { success: true }
}

export async function reenviarCertificacionBancaria(id: string) {
    const supabase = await createClient()

    // 1. Obtener información del proveedor
    const { data: prov, error: provError } = await supabase
        .from('proveedores')
        .select('razon_social, primer_nombre, primer_apellido')
        .eq('id', id)
        .single()

    if (provError || !prov) {
        return { success: false, error: 'Proveedor no encontrado' }
    }

    const nombreProveedor = prov.razon_social || `${prov.primer_nombre || ''} ${prov.primer_apellido || ''}`.trim() || 'Proveedor'

    // 2. Buscar documento de certificación bancaria
    const { data: certDocs, error: docError } = await supabase
        .from('proveedor_documentos')
        .select('file_path, nombre_archivo')
        .eq('proveedor_id', id)
        .or('tipo_documento.ilike.%CERT%BANCARI%,tipo_documento.ilike.%BANK%CERTIFICATION%')
        .order('created_at', { ascending: false })
        .limit(1)

    if (docError || !certDocs || certDocs.length === 0 || !certDocs[0].file_path) {
        return { success: false, error: 'Este proveedor no tiene una certificación bancaria adjunta.' }
    }

    const filePath = certDocs[0].file_path
    const { data: publicUrlData } = supabase.storage.from('proveedores').getPublicUrl(filePath)
    const archivoUrl = publicUrlData?.publicUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proveedores/${filePath}`
    const originalName = certDocs[0].nombre_archivo || 'Certificado.pdf'
    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'pdf'
    const finalFileName = `Certificado_Bancario_${nombreProveedor.replace(/\s+/g, '_')}.${ext}`

    let base64 = ''
    try {
        const { data: fileData } = await supabase.storage.from('proveedores').download(filePath)
        if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer()
            base64 = Buffer.from(arrayBuffer).toString('base64')
        }
    } catch (dlErr) {
        console.warn('No se pudo descargar certificado para base64:', dlErr)
    }

    try {
        await sendBankCertificateFlow(nombreProveedor, finalFileName, archivoUrl, base64)
        return { success: true, message: `Certificación bancaria de ${nombreProveedor} enviada con éxito.` }
    } catch (err: any) {
        console.error('Error al reenviar certificación bancaria:', err)
        return { success: false, error: err.message || 'Error al disparar el flujo de certificación bancaria.' }
    }
}
