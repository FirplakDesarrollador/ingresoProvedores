'use server'

import { createClient } from '@/lib/supabase/server'
import { createBusinessPartner, SapProveedorData } from '@/lib/sap'

export interface ProveedorFormData {
    // Tipo
    tipo_solicitud: string
    tipo_contraparte: 'persona_natural' | 'persona_juridica' | 'empleado' | 'extranjero' | 'contado'
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

    // Nuevos campos para extranjeros
    pagina_web?: string
    rep_legal_lugar_expedicion?: string
    rep_legal_telefono?: string
    rep_legal_email?: string
    swift_code?: string
    aba_code?: string
    persona_contacto?: string
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
            'tiene_sanciones_lavado',
            'administra_recursos_publicos',
            'tiene_grado_poder_publico',
            'tiene_vinculo_pep',
            'es_pep',
            'tiene_reconocimiento_publico'
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

        // Generar UUID en el servidor para no depender de .select() después del insert.
        // RLS bloquea SELECT para usuarios no autenticados, lo que causaba que el insert
        // se guardara exitosamente pero el .select().single() fallara, mostrando un error
        // falso al usuario. Al reintentar, el segundo insert fallaba con error 23505 (duplicado).
        const proveedorId = crypto.randomUUID()

        const { error } = await supabase
            .from('proveedores')
            .insert({ id: proveedorId, ...processedData })

        if (error) {
            console.error('Error al insertar proveedor:', error)
            return { success: false, error: `DB Error: ${error.message} (${error.code})` }
        }

        console.log('Proveedor registrado con éxito:', proveedorId)

        // Automatización para empleados: Enviar a SAP de inmediato y marcar como aprobado
        if (processedData.tipo_contraparte === 'empleado') {
            try {
                console.log(`Intentando crear BP en SAP automáticamente para el empleado ${proveedorId}...`)
                const sapResult = await createBusinessPartner({ id: proveedorId, ...processedData } as SapProveedorData)
                
                if (sapResult.success) {
                    await supabase
                        .from('proveedores')
                        .update({
                            estado: 'aprobado',
                            estado_contabilidad: 'aprobado',
                            fecha_decision: new Date().toISOString()
                        })
                        .eq('id', proveedorId)
                    console.log('Empleado enviado a SAP y aprobado automáticamente.')
                } else {
                    console.error('El empleado falló su creación automática en SAP:', sapResult.error)
                    // No detenemos el proceso, quedará pendiente para revisión manual si falla
                }
            } catch (sapError) {
                console.error('Error en la integración automática con SAP para empleado:', sapError)
            }
        }

        return { success: true, id: proveedorId }
    } catch (e: any) {
        console.error('Excepción en submitProveedorForm:', e)
        return { success: false, error: e.message || 'Error desconocido en el servidor' }
    }
}

export async function uploadDocument(formData: FormData) {
    const proveedorId = formData.get('proveedorId') as string
    const tipoDocumento = formData.get('tipoDocumento') as string
    const nombreProveedor = formData.get('nombreProveedor') as string
    const file = formData.get('file') as File

    console.log(`Iniciando subida de ${tipoDocumento} para proveedor ${proveedorId}...`)
    
    if (!file || !proveedorId || !tipoDocumento) {
        console.error('Faltan datos en uploadDocument:', { hasFile: !!file, proveedorId, tipoDocumento })
        return { success: false, error: 'Faltan datos requeridos (archivo, ID o tipo)' }
    }

    try {
        const supabase = await createClient()

        // Convertir File a ArrayBuffer para mayor compatibilidad en entornos Node.js
        console.log(`Procesando archivo ${tipoDocumento} (${file.size} bytes)...`)
        let fileBuffer: ArrayBuffer
        try {
            fileBuffer = await file.arrayBuffer()
        } catch (err: any) {
            console.error('Error convirtiendo archivo a ArrayBuffer:', err)
            return { success: false, error: 'No se pudo procesar el archivo. Intente de nuevo.' }
        }

        const fileExtension = file.name?.includes('.') ? file.name.split('.').pop() : 'pdf'
        // Sanitizar el nombre del tipo de documento para la ruta
        const safeTipoDocumento = tipoDocumento.replace(/\s+/g, '_').toUpperCase()
        const filePath = `${proveedorId}/${safeTipoDocumento}_${Date.now()}.${fileExtension}`

        console.log(`Subiendo a Storage: ${filePath}...`)

        // Subir el archivo al bucket 'proveedores'
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('proveedores')
            .upload(filePath, fileBuffer, {
                contentType: file.type || 'application/pdf',
                upsert: true
            })

        if (uploadError) {
            console.error(`Error de Supabase Storage para ${tipoDocumento}:`, uploadError)
            return { success: false, error: `Error de almacenamiento: ${uploadError.message}` }
        }

        // Registrar en la base de datos
        console.log(`Registrando en base de datos: ${tipoDocumento}`)
        const { error: dbError } = await supabase
            .from('proveedor_documentos')
            .insert({
                proveedor_id: proveedorId,
                tipo_documento: tipoDocumento,
                nombre_archivo: file.name || `${tipoDocumento}.${fileExtension}`,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type || 'application/pdf'
            })

        if (dbError) {
            console.error(`Error en DB para ${tipoDocumento}:`, dbError)
            return { success: false, error: `Error de base de datos: ${dbError.message}` }
        }

        // Si es certificado bancario Y el proveedor es un empleado, lo enviamos al flujo de inmediato
        if (tipoDocumento.includes('CERT BANCARI')) {
            const { data: provData } = await supabase.from('proveedores').select('tipo_contraparte').eq('id', proveedorId).single();
            
            if (provData && provData.tipo_contraparte === 'empleado') {
                try {
                    console.log('Enviando certificado bancario al flujo automáticamente para el empleado...');
                    const base64 = Buffer.from(fileBuffer).toString('base64');
                    const finalFileName = `Certificado_Bancario_${nombreProveedor.replace(/\s+/g, '_')}.${fileExtension}`;
                    await sendBankCertificateFlow(nombreProveedor, finalFileName, base64);
                    console.log('Certificado bancario enviado al flujo exitosamente.');
                } catch (flowError) {
                    console.error('Error al enviar el certificado bancario al flujo:', flowError);
                }
            }
        }

        console.log(`Documento ${tipoDocumento} subido y registrado con éxito`)
        return { success: true, path: filePath }
    } catch (e: any) {
        console.error(`Excepción crítica en uploadDocument (${tipoDocumento}):`, e)
        return { success: false, error: e.message || 'Error inesperado al subir archivo' }
    }
}

export async function getActividadesEconomicas() {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'src', 'lib', 'actividades_sap.json');
        
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(fileData);
            // SAP fields: Code, Descripcion
            return { success: true, data: parsed };
        }
        
        return { success: true, data: [] };
    } catch (e) {
        console.error('Error al obtener actividades económicas de JSON:', e);
        return { success: false, data: [] };
    }
}

export async function getMunicipiosSap() {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'src', 'lib', 'municipios_sap.json');
        
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(fileData);
            // SAP fields: Code, Name, U_NomDepartamento, U_NomMunicipio
            return { success: true, data: parsed };
        }
        
        return { success: true, data: [] };
    } catch (e) {
        console.error('Error al obtener municipios de JSON:', e);
        return { success: false, data: [] };
    }
}

export async function getBancosSap() {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'src', 'lib', 'bancos_sap.json');
        
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(fileData);
            return { success: true, data: parsed };
        }
        
        return { success: true, data: [] };
    } catch (e) {
        console.error('Error al obtener bancos de JSON:', e);
        return { success: false, data: [] };
    }
}

async function sendNotificationEmail(nombreProveedor: string) {
    const flowUrl = process.env.FLOW_URL
    
    if (!flowUrl || flowUrl.includes('prod-XX.region.logic.azure.com')) {
        console.warn('FLOW_URL no configurado o es el valor por defecto. Saltando envío de email.')
        return
    }

    const payload = {
        titulo: `Se ha creado un nuevo proveedor (${nombreProveedor})`,
        contenido: "Ingresa a la plataforma (https://ingreso-provedores.vercel.app/login) y aprueba tus proveedores pendientes."
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

        console.log('Email de notificación enviado con éxito')
    } catch (error) {
        console.error('Error al llamar al flow de notificación:', error)
        throw error
    }
}

export async function sendBankCertificateFlow(nombreProveedor: string, fileName: string, fileBase64: string) {
    const flowUrl = process.env.FLOW_CERTIFICADO_BANCARIO_URL
    
    if (!flowUrl) {
        console.warn('FLOW_CERTIFICADO_BANCARIO_URL no configurado. Saltando envío de certificado.')
        return
    }

    const allowedKeys = [
        'tipo_contraparte',
        'razon_social',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'numero_identificacion',
        'tipo_documento',
        'email',
        'celular',
        'direccion',
        'ciudad',
        'departamento',
        'pais',
        'telefono1_numero',
        'rep_legal_nombre_completo',
        'rep_legal_numero_identificacion',
        'correo_facturacion',
        'pagina_web',
        'persona_contacto',
        'tipo_sociedad',
        'codigo_ciiu',
        'origen_capital',
        'entidad_bancaria',
        'numero_cuenta',
        'tipo_cuenta',
        'swift_code',
        'aba_code',
        'dias_credito',
        'area_solicitante',
        'tipo_provision',
        'monto_aprox',
        'frecuencia_compra',
        'referencia_comercial_1',
        'referencia_comercial_2',
        'nacionalidad',
        'regimen_tributario',
        'regimen_fiscal',
        'medio_de_pago',
        'actividad_economica',
        'municipio_med_mag',
        'realiza_operaciones_internacionales',
        'tiene_evaluacion_sst',
        'rep_legal_es_pep',
        'tiene_sanciones_lavado',
        'rep_legal_lugar_expedicion',
        'rep_legal_telefono',
        'rep_legal_email',
        'acepta_terminos',
        'detalle_origen_fondos',
        'tipo_transacciones'
    ]

    const payload = {
        titulo: nombreProveedor,
        contenido: "Se ha adjuntado un nuevo certificado bancario para tu revisión.",
        nombreArchivo: fileName,
        pdf: fileBase64
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
            throw new Error(`Error en el flow de certificado (${response.status}): ${errorText}`)
        }

        console.log('Flujo de certificado bancario enviado con éxito')
    } catch (error) {
        console.error('Error al llamar al flow de certificado:', error)
        throw error
    }
}

export async function getPaises() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('paises')
            .select('codigo, pais')
            .order('pais')
        
        if (error) {
            console.error('Error fetching paises:', error)
            return []
        }
        return data as { codigo: string; pais: string }[]
    } catch (e) {
        console.error('Error in getPaises:', e)
        return []
    }
}
