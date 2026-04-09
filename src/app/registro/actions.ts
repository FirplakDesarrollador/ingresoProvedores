'use server'

import { createClient } from '@/lib/supabase/server'

export interface ProveedorFormData {
    // Tipo
    tipo_solicitud: string
    tipo_contraparte: 'persona_natural' | 'persona_juridica'
    area_solicitante?: string

    // Persona Natural
    tipo_documento?: string
    numero_identificacion?: string
    primer_apellido?: string
    segundo_apellido?: string
    primer_nombre?: string
    segundo_nombre?: string
    fecha_expedicion?: string
    lugar_expedicion?: string
    fecha_nacimiento?: string
    lugar_nacimiento?: string
    direccion?: string
    pais?: string
    departamento?: string
    ciudad?: string
    telefono1_codigo?: string
    telefono1_numero?: string
    celular?: string
    email?: string
    profesion?: string

    // PEP
    es_pep?: boolean
    tiene_vinculo_pep?: boolean
    administra_recursos_publicos?: boolean
    tiene_reconocimiento_publico?: boolean
    tiene_grado_poder_publico?: boolean

    // Persona Jurídica
    razon_social?: string
    tipo_sociedad?: string
    origen_capital?: string
    codigo_ciiu?: string
    correo_facturacion?: string

    // Representante Legal
    rep_legal_primer_nombre?: string
    rep_legal_segundo_nombre?: string
    rep_legal_primer_apellido?: string
    rep_legal_segundo_apellido?: string
    rep_legal_tipo_documento?: string
    rep_legal_numero_identificacion?: string

    // Financiera
    total_activos?: number
    total_pasivos?: number
    total_patrimonio?: number
    ingresos_mensuales?: number
    egresos_mensuales?: number
    otros_ingresos_mensuales?: number
    concepto_otros_ingresos?: string
    posee_activos_virtuales?: boolean
    fecha_corte_info_financiera?: string

    // Bancaria
    tipo_cuenta?: string
    entidad_bancaria?: string
    numero_cuenta?: string

    // Operaciones internacionales
    tipo_transacciones?: string[]

    // Aceptación
    acepta_terminos?: boolean
    detalle_origen_fondos?: string

    // Nuevos campos representate legal y cumplimiento
    rep_legal_nombre_completo?: string
    rep_legal_es_pep?: string
    tiene_sanciones_lavado?: string

    // Internacional y SST
    realiza_operaciones_internacionales?: any // boolean or string "Sí"/"No"
    tiene_evaluacion_sst?: any // boolean or string "Sí"/"No"
}

export async function submitProveedorForm(data: ProveedorFormData) {
    console.log('Iniciando submitProveedorForm con:', JSON.stringify(data).substring(0, 100) + '...')
    try {
        const supabase = await createClient()

        // Convertir campos Sí/No a booleanos para la base de datos
        const processedData = { ...data }
        const siNoColumns = [
            'realiza_operaciones_internacionales', 
            'tiene_evaluacion_sst',
            'rep_legal_es_pep',
            'tiene_sanciones_lavado'
        ]

        siNoColumns.forEach(col => {
            if (processedData[col as keyof ProveedorFormData] === 'Sí') {
                (processedData as any)[col] = true
            } else if (processedData[col as keyof ProveedorFormData] === 'No') {
                (processedData as any)[col] = false
            } else if (processedData[col as keyof ProveedorFormData] === undefined) {
                 (processedData as any)[col] = false
            }
        })

        // Asegurar que campos numéricos vacíos sean null
        const numericFields = ['total_activos', 'total_pasivos', 'total_patrimonio', 'ingresos_mensuales', 'egresos_mensuales', 'otros_ingresos_mensuales']
        numericFields.forEach(field => {
            if ((processedData as any)[field] === '' || (processedData as any)[field] === undefined) {
                (processedData as any)[field] = null
            } else {
                // Forzar conversión a número
                const val = Number((processedData as any)[field])
                if (!isNaN(val)) {
                    (processedData as any)[field] = val
                }
            }
        })

        const { data: proveedor, error } = await supabase
            .from('proveedores')
            .insert(processedData)
            .select()
            .single()

        if (error) {
            console.error('Error al insertar proveedor:', error)
            return { success: false, error: `DB Error: ${error.message} (${error.code})` }
        }

        console.log('Proveedor registrado con éxito:', proveedor.id)
        return { success: true, id: proveedor.id }
    } catch (e: any) {
        console.error('Excepción en submitProveedorForm:', e)
        return { success: false, error: e.message || 'Error desconocido en el servidor' }
    }
}

export async function uploadDocument(formData: FormData) {
    const proveedorId = formData.get('proveedorId') as string
    const tipoDocumento = formData.get('tipoDocumento') as string
    const file = formData.get('file') as File

    console.log(`Iniciando subida de ${tipoDocumento} para proveedor ${proveedorId}...`)
    
    if (!file || !proveedorId || !tipoDocumento) {
        console.error('Faltan parámetros obligatorios en uploadDocument')
        return { success: false, error: 'Faltan parámetros obligatorios' }
    }

    try {
        const supabase = await createClient()

        const fileExtension = file.name.split('.').pop()
        const filePath = `${proveedorId}/${tipoDocumento}_${Date.now()}.${fileExtension}`

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('proveedores')
            .upload(filePath, file, {
                contentType: file.type || 'application/pdf',
                upsert: true
            })


        if (uploadError) {
            console.error(`Error al subir ${tipoDocumento} a bucket 'proveedores':`, uploadError)
            return { success: false, error: `Storage Error: ${uploadError.message}` }
        }

        // Save reference in database
        const { error: dbError } = await supabase
            .from('proveedor_documentos')
            .insert({
                proveedor_id: proveedorId,
                tipo_documento: tipoDocumento,
                nombre_archivo: file.name,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type
            })

        if (dbError) {
            console.error('Error al guardar referencia en DB:', dbError)
            return { success: false, error: dbError.message }
        }

        console.log(`Documento ${tipoDocumento} subido con éxito`)
        return { success: true, path: filePath }
    } catch (e: any) {
        console.error('Excepción en uploadDocument:', e)
        return { success: false, error: e.message || 'Error desconocido al subir archivo' }
    }
}
