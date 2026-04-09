'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { submitProveedorForm, uploadDocument } from './actions'

type TipoContraparte = 'persona_natural' | 'persona_juridica' | 'empleado' | ''

export default function RegistroPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
            <RegistroForm />
        </Suspense>
    )
}

function RegistroForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingText, setLoadingText] = useState('Procesando...')
    const [tipoContraparte, setTipoContraparte] = useState<TipoContraparte>('')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const tipo = searchParams.get('tipo')
        if (tipo === 'empleado') {
            setTipoContraparte('empleado')
            setStep(2)
        }
    }, [searchParams])

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Determinar el número total de pasos según el tipo
    const getTotalSteps = () => {
        if (tipoContraparte === 'empleado') return 3 // Tipo, Info General, Bancaria
        return 5 // Tipo, Info General, PEP, Financiera, Documentos
    }

    // Obtener el siguiente paso según el tipo
    const getNextStep = (currentStep: number) => {
        if (tipoContraparte === 'empleado') {
            // Empleado: 1 -> 2 -> 4 (bancaria) -> submit
            if (currentStep === 2) return 4 // Saltar directo a bancaria
        }
        return currentStep + 1
    }

    // Obtener el paso anterior según el tipo
    const getPrevStep = (currentStep: number) => {
        if (tipoContraparte === 'empleado') {
            if (currentStep === 4) return 2 // De bancaria volver a info general
        }
        return currentStep - 1
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Filtrar los datos para enviar solo lo que la base de datos espera
            // y eliminar cualquier objeto File o dato no serializable
            const allowedKeys = [
                'tipo_solicitud', 'tipo_contraparte', 'area_solicitante', 'tipo_documento', 
                'numero_identificacion', 'primer_apellido', 'segundo_apellido', 'primer_nombre', 
                'segundo_nombre', 'fecha_expedicion', 'lugar_expedicion', 'fecha_nacimiento', 
                'lugar_nacimiento', 'direccion', 'pais', 'departamento', 'ciudad', 
                'telefono1_codigo', 'telefono1_numero', 'celular', 'email', 'profesion', 
                'es_pep', 'tiene_vinculo_pep', 'administra_recursos_publicos', 'tiene_reconocimiento_publico', 
                'tiene_grado_poder_publico', 'razon_social', 'tipo_sociedad', 'origen_capital', 
                'codigo_ciiu', 'correo_facturacion', 'total_activos', 'total_pasivos', 
                'total_patrimonio', 'ingresos_mensuales', 'egresos_mensuales', 'otros_ingresos_mensuales',
                'concepto_otros_ingresos', 'posee_activos_virtuales', 'fecha_corte_info_financiera',
                'tipo_cuenta', 'entidad_bancaria', 'numero_cuenta', 'acepta_terminos', 
                'detalle_origen_fondos', 'rep_legal_nombre_completo', 'rep_legal_numero_identificacion',
                'rep_legal_es_pep', 'tiene_sanciones_lavado', 'realiza_operaciones_internacionales', 
                'tiene_evaluacion_sst'
            ]

            const cleanFormData: Record<string, any> = {}
            allowedKeys.forEach(key => {
                if (formData[key] !== undefined) {
                    cleanFormData[key] = formData[key]
                }
            })

            const result = await submitProveedorForm({
                ...cleanFormData as any,
                tipo_solicitud: 'Nuevo Registro',
                tipo_contraparte: tipoContraparte as any
            })

            if (result.success && result.id) {
                const proveedorId = result.id

                // 2. Upload files using FormData
                const fileFields = [
                    'rut', 
                    'documento_identidad', 
                    'cert_bancaria', 
                    'camara_comercio', 
                    'estados_financieros',
                    'doc_identidad_rep_legal',
                    'composicion_accionaria',
                    'referencias_comerciales',
                    'certificado_arl_sst',
                    'certificado_sagrilaft',
                    'otros_documentos',
                    'firma' // Incluimos la firma aquí también
                ]

                // 2. Subir archivos SECUENCIALMENTE para mayor estabilidad
                console.log('Iniciando subida secuencial de documentos...')
                const errors: string[] = []
                
                for (const field of fileFields) {
                    const file = formData[field]
                    if (file instanceof File) {
                        const label = field === 'firma' ? 'FIRMA' : field.replace(/_/g, ' ').toUpperCase()
                        console.log(`Subiendo ${label}...`)
                        setLoadingText(`Subiendo ${label}...`)
                        
                        const uploadFormData = new FormData()
                        uploadFormData.append('file', file)
                        uploadFormData.append('proveedorId', proveedorId)
                        uploadFormData.append('tipoDocumento', label)
                        
                        try {
                            const uploadRes = await uploadDocument(uploadFormData)
                            if (!uploadRes.success) {
                                errors.push(`${label}: ${uploadRes.error}`)
                            }
                        } catch (err: any) {
                            errors.push(`${label}: ${err.message || 'Error desconocido'}`)
                        }
                    }
                }

                if (errors.length > 0) {
                    alert(`El registro se guardó, pero hubo problemas con algunos documentos:\n- ${errors.join('\n- ')}\n\nContacte a soporte si el problema persiste.`)
                }

                router.push(`/registro/exito?id=${proveedorId}`)
            } else {
                alert('Error al registrar: ' + (result as any).error)
                setLoading(false)
            }
        } catch (e: any) {
            console.error('Error en handleSubmit:', e)
            alert('Error inesperado: ' + e.message)
            setLoading(false)
        }
    }

    // Calcular el progreso visual
    const getProgressSteps = () => {
        const total = getTotalSteps()
        if (tipoContraparte === 'empleado') {
            // Mapear los pasos reales a pasos visuales para empleado
            if (step === 1) return { current: 1, total }
            if (step === 2) return { current: 2, total }
            if (step === 4) return { current: 3, total }
        }
        return { current: step, total }
    }

    const progress = getProgressSteps()

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#254153] text-white py-6">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold">Formulario de Conocimiento de Contrapartes</h1>
                    <p className="text-white/70 text-sm mt-1">Complete todos los campos requeridos</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {Array.from({ length: progress.total }, (_, i) => i + 1).map(s => (
                        <div key={s} className={`h-2 flex-1 rounded ${progress.current >= s ? 'bg-[#254153]' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {/* Step 1: Área y Tipo */}
                {step === 1 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-[#254153] mb-4">Información de Origen</h2>
                            <Select 
                                label="¿Desde qué área de la empresa viene?" 
                                name="area_solicitante" 
                                value={formData.area_solicitante} 
                                onChange={updateField} 
                                options={[
                                    'Admón y Contabilidad',
                                    'Legal',
                                    'SST y Ambiental',
                                    'Compras',
                                    'Comer',
                                    'Logística',
                                    'TI',
                                    'Talento Humano',
                                    'Almacén',
                                    'Mantenimiento',
                                    'Otros'
                                ]} 
                            />
                        </div>

                        <h2 className="text-xl font-semibold text-[#254153] mb-6">Tipo de Contraparte</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setTipoContraparte('persona_natural')}
                                className={`p-6 rounded-xl border-2 text-left transition ${tipoContraparte === 'persona_natural'
                                    ? 'border-[#254153] bg-[#254153]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-3xl mb-2 block">👤</span>
                                <span className="font-semibold text-[#254153]">Persona Natural</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoContraparte('persona_juridica')}
                                className={`p-6 rounded-xl border-2 text-left transition ${tipoContraparte === 'persona_juridica'
                                    ? 'border-[#254153] bg-[#254153]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-3xl mb-2 block">🏢</span>
                                <span className="font-semibold text-[#254153]">Persona Jurídica</span>
                            </button>
                        </div>

                        {/* Botón de prueba (Solo para desarrollo) */}
                        <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                            <button
                                onClick={() => {
                                    const randomId = Math.floor(Math.random() * 900000) + 100000;
                                    setTipoContraparte('persona_juridica');
                                    setFormData({
                                        area_solicitante: 'Compras',
                                        razon_social: `EMPRESA DE PRUEBA ${randomId} SAS`,
                                        numero_identificacion: `900${randomId}-7`,
                                        codigo_ciiu: '4669',
                                        tipo_sociedad: 'S.A.S.',
                                        origen_capital: 'Privada',
                                        ciudad: 'Medellín',
                                        departamento: 'Antioquia',
                                        rep_legal_nombre_completo: 'JUAN PEREZ TEST',
                                        rep_legal_numero_identificacion: '123456789',
                                        correo_facturacion: 'test@example.com',
                                        es_pep: false,
                                        tiene_vinculo_pep: false,
                                        administra_recursos_publicos: false,
                                        tiene_reconocimiento_publico: false,
                                        tiene_grado_poder_publico: false,
                                        rep_legal_es_pep: 'No',
                                        tiene_sanciones_lavado: 'No',
                                        total_activos: 100000000,
                                        total_pasivos: 50000000,
                                        total_patrimonio: 50000000,
                                        ingresos_mensuales: 20000000,
                                        egresos_mensuales: 15000000,
                                        fecha_corte_info_financiera: '2023-12-31',
                                        posee_activos_virtuales: false,
                                        tipo_cuenta: 'Ahorros',
                                        entidad_bancaria: 'BANCOLOMBIA',
                                        numero_cuenta: '987654321',
                                        realiza_operaciones_internacionales: 'No',
                                        tiene_evaluacion_sst: 'Sí',
                                        acepta_terminos: true,
                                        detalle_origen_fondos: 'Actividad comercial de prueba'
                                    });
                                    setStep(5); // Saltamos directo a documentos
                                }}
                                className="w-full py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors"
                            >
                                🧪 Llenar con datos de prueba (Saltar al Paso 5)
                            </button>
                        </div>

                        <button
                            onClick={() => tipoContraparte && formData.area_solicitante && setStep(2)}
                            disabled={!tipoContraparte || !formData.area_solicitante}
                            className="mt-6 w-full py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* Step 2: Info General */}
                {step === 2 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">
                            {tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado'
                                ? 'Información Personal'
                                : 'Información de la Empresa'}
                        </h2>

                        {(tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado') ? (
                            <div className="grid grid-cols-2 gap-4">
                                <Select 
                                    label="Tipo Documento" 
                                    name="tipo_documento" 
                                    value={formData.tipo_documento} 
                                    onChange={updateField} 
                                    options={[
                                        'Cédula de Ciudadanía', 
                                        'Cédula de Extranjería', 
                                        'Pasaporte', 
                                        'Tarjeta de Identidad', 
                                        'NIT',
                                        'Otro'
                                    ]} 
                                />
                                <Input label="Número Identificación" name="numero_identificacion" value={formData.numero_identificacion} onChange={updateField} type="number" />
                                <Input label="Primer Nombre" name="primer_nombre" value={formData.primer_nombre} onChange={updateField} />
                                <Input label="Segundo Nombre" name="segundo_nombre" value={formData.segundo_nombre} onChange={updateField} />
                                <Input label="Primer Apellido" name="primer_apellido" value={formData.primer_apellido} onChange={updateField} />
                                <Input label="Segundo Apellido" name="segundo_apellido" value={formData.segundo_apellido} onChange={updateField} />
                                <Input label="Email" name="email" type="email" value={formData.email} onChange={updateField} />
                                <Input label="Celular" name="celular" value={formData.celular} onChange={updateField} type="number" />
                                <Input label="Dirección" name="direccion" value={formData.direccion} className="col-span-2" onChange={updateField} />
                                <Input label="Ciudad" name="ciudad" value={formData.ciudad} onChange={updateField} />
                                <Input label="Departamento" name="departamento" value={formData.departamento} onChange={updateField} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Razón Social" name="razon_social" value={formData.razon_social} className="col-span-2" onChange={updateField} />
                                <Input label="NIT" name="numero_identificacion" value={formData.numero_identificacion} onChange={updateField} />
                                <Input label="Código CIIU" name="codigo_ciiu" value={formData.codigo_ciiu} onChange={updateField} />
                                <Select label="Tipo Sociedad" name="tipo_sociedad" value={formData.tipo_sociedad} onChange={updateField}
                                    options={['Anónima', 'Limitada', 'S.A.S.', 'Sin Ánimo de Lucro', 'Otra']} />
                                <Select label="Origen Capital" name="origen_capital" value={formData.origen_capital} onChange={updateField}
                                    options={['Privada', 'Pública', 'Mixta']} />
                                <Input label="Ciudad" name="ciudad" value={formData.ciudad} onChange={updateField} />
                                <Input label="Departamento" name="departamento" value={formData.departamento} onChange={updateField} />
                                <Input label="Nombre Representante Legal" name="rep_legal_nombre_completo" value={formData.rep_legal_nombre_completo} className="col-span-2" onChange={updateField} />
                                <Input label="CC Representante Legal" name="rep_legal_numero_identificacion" value={formData.rep_legal_numero_identificacion} onChange={updateField} />
                                <Input label="Correo Facturación" name="correo_facturacion" type="email" value={formData.correo_facturacion} className="col-span-2" onChange={updateField} />
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>
                            <button 
                                onClick={() => setStep(getNextStep(2))} 
                                disabled={
                                    tipoContraparte === 'persona_juridica' 
                                    ? (!formData.razon_social || !formData.numero_identificacion || !formData.codigo_ciiu || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || !formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)
                                }
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: PEP */}
                {step === 3 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">Preguntas PEP</h2>
                        <div className="space-y-4">
                            <Checkbox label="¿Es Persona Expuesta Políticamente (PEP)?" name="es_pep" checked={formData.es_pep} onChange={updateField} />
                            <Checkbox label="¿Tiene vínculo con una persona considerada PEP?" name="tiene_vinculo_pep" checked={formData.tiene_vinculo_pep} onChange={updateField} />
                            <Checkbox label="¿Administra recursos públicos?" name="administra_recursos_publicos" checked={formData.administra_recursos_publicos} onChange={updateField} />
                            <Checkbox label="¿Tiene reconocimiento público?" name="tiene_reconocimiento_publico" checked={formData.tiene_reconocimiento_publico} onChange={updateField} />
                            <Checkbox label="¿Tiene grado de poder público?" name="tiene_grado_poder_publico" checked={formData.tiene_grado_poder_publico} onChange={updateField} />
                            
                            {/* Nuevas preguntas de cumplimiento */}
                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <Select 
                                    label="¿El representante legal es PEP?" 
                                    name="rep_legal_es_pep" 
                                    value={formData.rep_legal_es_pep} 
                                    onChange={updateField} 
                                    options={['Sí', 'No']} 
                                />
                                <Select 
                                    label="¿Alguno de sus accionistas, beneficiarios finales o representantes legales ha sido investigado, vinculado o sancionado por delitos relacionados con lavado de activos, corrupción o soborno?" 
                                    name="tiene_sanciones_lavado" 
                                    value={formData.tiene_sanciones_lavado} 
                                    onChange={updateField} 
                                    options={['Sí', 'No']} 
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>
                            <button 
                                onClick={() => setStep(4)} 
                                disabled={!formData.rep_legal_es_pep || !formData.tiene_sanciones_lavado}
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Financiera / Bancaria */}
                {step === 4 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">
                            {tipoContraparte === 'empleado' ? 'Información Bancaria' : 'Información Financiera y Bancaria'}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Solo mostrar campos financieros si NO es empleado */}
                            {tipoContraparte !== 'empleado' && (
                                <>
                                    <Input label="Total Activos" name="total_activos" type="number" value={formData.total_activos} onChange={updateField} />
                                    <Input label="Total Pasivos" name="total_pasivos" type="number" value={formData.total_pasivos} onChange={updateField} />
                                    <Input label="Total Patrimonio" name="total_patrimonio" type="number" value={formData.total_patrimonio} onChange={updateField} />
                                    <Input label="Ingresos Mensuales" name="ingresos_mensuales" type="number" value={formData.ingresos_mensuales} onChange={updateField} />
                                    <Input label="Egresos Mensuales" name="egresos_mensuales" type="number" value={formData.egresos_mensuales} onChange={updateField} />
                                    <Input label="Otros Ingresos" name="otros_ingresos_mensuales" type="number" value={formData.otros_ingresos_mensuales} onChange={updateField} optional />
                                    <Input label="Concepto Otros Ingresos" name="concepto_otros_ingresos" value={formData.concepto_otros_ingresos} onChange={updateField} optional />
                                    <div className="col-span-2">
                                        <Input label="Fecha de Corte Información Financiera" name="fecha_corte_info_financiera" type="date" value={formData.fecha_corte_info_financiera} onChange={updateField} />
                                    </div>
                                    <div className="col-span-2 mb-4">
                                        <Checkbox label="¿Posee Activos Virtuales (Criptoactivos, etc)?" name="posee_activos_virtuales" checked={formData.posee_activos_virtuales} onChange={updateField} />
                                    </div>
                                </>
                            )}

                            {/* Campos bancarios para todos */}
                            <div className="col-span-2 pt-4 border-t border-gray-100 mb-2">
                                <h3 className="text-sm font-bold text-[#254153] uppercase tracking-wider">Información Bancaria</h3>
                            </div>
                            <Select label="Tipo de Cuenta" name="tipo_cuenta" value={formData.tipo_cuenta} onChange={updateField} options={['Ahorros', 'Corriente']} />
                            <Input label="Entidad Bancaria" name="entidad_bancaria" value={formData.entidad_bancaria} onChange={updateField} />
                            <Input label="Número de Cuenta" name="numero_cuenta" value={formData.numero_cuenta} onChange={updateField} />
                            
                            {/* Nuevas preguntas financieras/cumplimiento */}
                            <div className="col-span-2 pt-4 border-t border-gray-100 space-y-4">
                                <Select 
                                    label="¿Realiza negocios en moneda extranjera?" 
                                    name="realiza_operaciones_internacionales" 
                                    value={formData.realiza_operaciones_internacionales} 
                                    onChange={updateField} 
                                    options={['Sí', 'No']} 
                                />
                                <Select 
                                    label="¿La empresa cuenta con la evaluación de autodiagnóstico SST (Resolución 0312; Artículo 27)?" 
                                    name="tiene_evaluacion_sst" 
                                    value={formData.tiene_evaluacion_sst} 
                                    onChange={updateField} 
                                    options={['Sí', 'No']} 
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(getPrevStep(4))} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>

                            {tipoContraparte === 'empleado' ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta || !formData.realiza_operaciones_internacionales || !formData.tiene_evaluacion_sst}
                                    className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            {loadingText}
                                        </span>
                                    ) : (
                                        'Enviar Formulario'
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setStep(5)} 
                                    disabled={!formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta || !formData.total_activos || !formData.total_pasivos || !formData.total_patrimonio || !formData.ingresos_mensuales || !formData.egresos_mensuales || !formData.fecha_corte_info_financiera || !formData.realiza_operaciones_internacionales || !formData.tiene_evaluacion_sst}
                                    className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    Continuar
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5: Documentos y Envío */}
                {step === 5 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">Documentos y Aceptación</h2>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-[#254153] mb-3">Documentos requeridos:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {tipoContraparte === 'persona_natural' ? (
                                    <>
                                        <li>• Copia del RUT</li>
                                        <li>• Documento de identidad (150%)</li>
                                        <li>• Dos referencias comerciales</li>
                                        <li>• Certificación bancaria (máx. 30 días)</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Cámara de Comercio (máx. 1 mes)</li>
                                        <li>• RUT</li>
                                        <li>• Documento del representante legal</li>
                                        <li>• Composición accionaria</li>
                                        <li>• Balances y Estados Financieros</li>
                                        <li>• Certificación bancaria</li>
                                        <li>• Dos referencias comerciales</li>
                                        <li>• Certificado ARL (Autodiagnóstico SST)</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="space-y-4 mb-8 text-sm text-gray-700 leading-relaxed">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="font-semibold mb-2 text-[#254153]">DECLARACIÓN EXPRESA:</p>
                                <p className="mb-4">
                                    Declaro expresamente que: El contenido de esta información es veraz y verificable, realizo la siguiente declaración 
                                    de fuente de bienes y fondos a <strong>Firplak SA</strong>, con el propósito de dar cumplimiento a las normas legales vigentes.
                                </p>
                                

                                <div className="space-y-3">
                                    <p>
                                        2). Tanto mi actividad, profesión u oficio es lícita y la ejerzo dentro del marco legal. Los recursos que poseo 
                                        no provienen de actividades ilícitas contempladas en el Código Penal de Colombia o cualquier norma que le modifique o adicione.
                                    </p>
                                    <p>
                                        3). La información que he suministrado en este documento es veraz y verificable y me obligo a actualizarla anualmente.
                                    </p>
                                    <p>
                                        4). De manera irrevocable, autorizo a <strong>Firplak SA</strong> para solicitar, consultar, procesar, suministrar, reportar 
                                        o divulgar, conforme a lo establecido en la <strong>Ley 1581 de 2012</strong> (protección de datos personales) y la <strong>Ley 1266 de 2008</strong> 
                                        (manejo de información financiera, crediticia, comercial y de servicios), la información contenida en este formulario.
                                    </p>
                                    <p>
                                        5). Los recursos que se deriven del desarrollo de relaciones comerciales, no se destinarán a la financiación del terrorismo, 
                                        grupos terroristas o actividades terroristas.
                                    </p>
                                    <p>
                                        6). Eximimos a <strong>Firplak SA</strong>, sus representantes legales y administradores, de toda responsabilidad que se derive 
                                        por información errónea, falsa o inexacta que se hubiere proporcionado en este documento o de la violación del mismo.
                                    </p>
                                </div>

                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <p className="font-semibold mb-3 text-[#254153]">AUTORIZACIÓN DE REPORTE Y CONSULTA:</p>
                                    <p className="mb-4">
                                        Autorizo a <strong>Firplak SA</strong> para reportar, consultar y/o divulgar ante centrales de riesgo legalmente constituidas, 
                                        datos sobre el cumplimiento o incumplimiento de obligaciones crediticias o deberes patrimoniales, conforme a lo establecido en la <strong>Ley 1266 de 2008</strong>. 
                                        Esta autorización garantiza que dicha información sea veraz, pertinente, completa, actualizada y exacta. 
                                        La autorización subsistirá hasta que el proveedor deudor esté a paz y salvo con Firplak SA por todo concepto, incluso si el contrato ha finalizado.
                                    </p>
                                </div>

                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <p className="font-semibold mb-3 text-[#254153]">TRATAMIENTO DE DATOS PERSONALES:</p>
                                    <p className="mb-3">
                                        En cumplimiento de la <strong>Ley 1581 de 2012</strong> y sus decretos reglamentarios, usted autoriza el tratamiento de sus datos personales. 
                                        Responder preguntas sobre datos sensibles o menores es voluntario. Como titular, puede conocer, actualizar, rectificar y suprimir su información 
                                        a través del correo: <a href="mailto:protecciondatos@firplak.com" className="text-blue-600 underline">protecciondatos@firplak.com</a>.
                                    </p>
                                    <p>
                                        <strong>Firplak SA</strong> podrá transmitir o transferir sus Datos Personales a terceros aliados o empresas del Grupo, 
                                        dentro o fuera de países con medidas adecuadas de protección de datos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <FileInput label="RUT" name="rut" onChange={updateField} />
                            <FileInput label="Documento de Identidad" name="documento_identidad" onChange={updateField} />
                            <FileInput label="Certificación Bancaria" name="cert_bancaria" onChange={updateField} />
                            
                            {tipoContraparte === 'persona_juridica' && (
                                <>
                                    <FileInput label="Cámara de Comercio" name="camara_comercio" onChange={updateField} />
                                    <FileInput label="Estados Financieros" name="estados_financieros" onChange={updateField} />
                                    <FileInput label="Documento Identidad Representante Legal" name="doc_identidad_rep_legal" onChange={updateField} />
                                    <FileInput label="Composición Accionaria" name="composicion_accionaria" onChange={updateField} />
                                    <FileInput label="Certificado ARL Autodiagnóstico SST" name="certificado_arl_sst" onChange={updateField} />
                                </>
                            )}
                            
                            <FileInput label="Referencias Comerciales (PDF Único)" name="referencias_comerciales" onChange={updateField} />
                            <FileInput label="Certificado SAGRILAFT / SARLAFT" name="certificado_sagrilaft" onChange={updateField} optional />
                            <FileInput label="Otros Documentos" name="otros_documentos" onChange={updateField} optional />
                        </div>

                        <div className="mb-6 p-4 bg-[#254153]/5 border border-[#254153]/20 rounded-xl">
                            <label className="block text-sm font-semibold text-[#254153] mb-2">
                                (1) Los bienes que poseo provienen de: <span className="text-gray-500 font-normal">(Detalle de ocupación, oficio, actividad, negocio)</span> <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153] bg-white text-sm"
                                rows={2}
                                value={formData.detalle_origen_fondos || ''}
                                onChange={(e) => updateField('detalle_origen_fondos', e.target.value)}
                                placeholder="Especifique el origen de sus bienes aquí..."
                            />
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                (1.8) Firma y huella <span className="text-red-500">*</span>
                            </p>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="signature-upload"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) updateField('firma', file);
                                    }}
                                />
                                <label 
                                    htmlFor="signature-upload"
                                    className="cursor-pointer"
                                >
                                    <div className="text-4xl mb-2">📸</div>
                                    {formData.firma instanceof File ? (
                                        <p className="text-sm text-green-600 font-medium">✅ {formData.firma.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600">Haga clic para seleccionar una imagen de su firma</p>
                                            <p className="text-xs text-gray-400 mt-1">Formatos sugeridos: PNG, JPG</p>
                                        </>
                                    )}
                                </label>
                                {formData.firma && (
                                    <button 
                                        type="button"
                                        onClick={() => updateField('firma', null)}
                                        className="mt-3 text-xs text-red-600 underline"
                                    >
                                        Eliminar archivo
                                    </button>
                                )}
                            </div>
                        </div>

                        <Checkbox
                            label={
                                <span className="text-sm">
                                    Confirmo que la información es veraz, autorizo el tratamiento de mis datos personales y acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#254153] font-semibold underline hover:text-[#3a5d75]">Términos y Condiciones</button>, incluyendo la firma electrónica.
                                </span>
                            }
                            name="acepta_terminos"
                            checked={formData.acepta_terminos}
                            onChange={updateField}
                        />

                        {showTermsModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div 
                                    className="absolute inset-0 bg-[#254153]/40 backdrop-blur-sm transition-opacity"
                                    onClick={() => setShowTermsModal(false)}
                                />
                                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="bg-[#254153] p-4 text-white flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Formulario de Vinculación de Proveedores – FIRPLAK</h3>
                                        <button 
                                            onClick={() => setShowTermsModal(false)}
                                            className="p-1 hover:bg-white/10 rounded-full transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar text-gray-700 text-sm leading-relaxed space-y-4">
                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">1. Aceptación expresa e informada</h4>
                                                <p>El diligenciamiento del presente formulario implica la aceptación libre, previa, expresa e informada de los presentes Términos y Condiciones por parte del proveedor, ya sea persona natural o jurídica.</p>
                                                <p className="mt-2">De conformidad con lo establecido en el artículo 1602 del Código Civil Colombiano, todo contrato legalmente celebrado es ley para las partes. En ese sentido, la aceptación de estos términos genera efectos jurídicos vinculantes entre las partes.</p>
                                                <p className="mt-2">La manifestación de aceptación se entenderá realizada mediante la marcación del checkbox dispuesto para tal fin dentro del formulario, lo cual constituye prueba suficiente del consentimiento.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">2. Declaración de veracidad de la información</h4>
                                                <p>El proveedor declara bajo la gravedad de juramento, en los términos del artículo 442 del Código Penal Colombiano (falsedad en documento privado), que:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>La información suministrada es veraz, completa, exacta y actualizada.</li>
                                                    <li>Los documentos adjuntos son auténticos y corresponden a la realidad jurídica, financiera y operativa del proveedor.</li>
                                                </ul>
                                                <p className="mt-2">Así mismo, se compromete a actualizar oportunamente cualquier modificación relevante en la información suministrada.</p>
                                                <p className="mt-2">FIRPLAK podrá verificar dicha información a través de consultas en bases de datos públicas y privadas, conforme a lo permitido por la ley.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">3. Principio de buena fe</h4>
                                                <p>Las partes declaran actuar conforme al principio de buena fe, consagrado en el artículo 83 de la Constitución Política de Colombia, el cual presume que todas las actuaciones de los particulares se realizan de manera honesta, leal y transparente.</p>
                                                <p className="mt-2">En virtud de este principio, el proveedor se obliga a:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>No omitir información relevante</li>
                                                    <li>No suministrar información falsa o engañosa</li>
                                                    <li>Colaborar con los procesos de verificación y debida diligencia</li>
                                                </ul>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">4. Finalidad del tratamiento de la información</h4>
                                                <p>La información recolectada a través del presente formulario será utilizada para las siguientes finalidades:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Realizar procesos de conocimiento de contrapartes (KYC/KYS)</li>
                                                    <li>Ejecutar procedimientos de debida diligencia</li>
                                                    <li>Cumplir con obligaciones regulatorias en materia de:
                                                        <ul className="list-circle ml-5 mt-1">
                                                            <li>Sistema de Autocontrol y Gestión del Riesgo Integral LA/FT/FPADM (SAGRILAFT), conforme a la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades</li>
                                                            <li>Programa de Transparencia y Ética Empresarial (PTEE), conforme a la Circular Externa 100-000011 de 2021</li>
                                                        </ul>
                                                    </li>
                                                    <li>Validación en listas restrictivas y fuentes públicas</li>
                                                    <li>Gestión contractual, contable, administrativa y comercial</li>
                                                </ul>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">5. Autorización para el tratamiento de datos personales</h4>
                                                <p>De conformidad con lo dispuesto en la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes, el proveedor autoriza de manera previa, expresa e informada a FIRPLAK para:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Recolectar, almacenar, usar, circular, procesar y suprimir sus datos personales</li>
                                                    <li>Consultar y reportar información en bases de datos públicas o privadas</li>
                                                    <li>Verificar antecedentes judiciales, disciplinarios, fiscales y reputacionales</li>
                                                </ul>
                                                <p className="mt-2">El titular de los datos podrá ejercer en cualquier momento sus derechos de:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Conocer, actualizar y rectificar sus datos</li>
                                                    <li>Solicitar prueba de la autorización</li>
                                                    <li>Revocar la autorización y/o solicitar la supresión del dato</li>
                                                </ul>
                                                <p className="mt-2">A través de los canales dispuestos por FIRPLAK, en cumplimiento del artículo 8 de la Ley 1581 de 2012.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">6. Validación, verificación y control de riesgo</h4>
                                                <p>FIRPLAK, en cumplimiento de sus obligaciones en materia de prevención de riesgos LA/FT/FP y corrupción, se reserva el derecho de:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Verificar la información suministrada</li>
                                                    <li>Solicitar documentación adicional</li>
                                                    <li>Realizar análisis de riesgo del proveedor</li>
                                                </ul>
                                                <p className="mt-2">Así mismo, podrá rechazar, suspender o terminar el proceso de vinculación cuando:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Existan inconsistencias en la información</li>
                                                    <li>Se identifiquen riesgos reputacionales, legales o de cumplimiento</li>
                                                    <li>Se detecten coincidencias en listas restrictivas o señales de alerta</li>
                                                </ul>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">7. Declaraciones en materia de prevención de LA/FT/FP y corrupción</h4>
                                                <p>El proveedor declara que:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>No ha sido ni se encuentra vinculado a investigaciones o condenas relacionadas con lavado de activos, financiación del terrorismo, corrupción, soborno o delitos fuente</li>
                                                    <li>No figura en listas restrictivas nacionales o internacionales vinculantes</li>
                                                    <li>Sus recursos provienen de actividades lícitas</li>
                                                </ul>
                                                <p className="mt-2">Lo anterior en concordancia con las obligaciones establecidas en el régimen de cumplimiento empresarial y estándares internacionales como las recomendaciones del GAFI.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">8. Conservación de la información</h4>
                                                <p>La información será conservada por el tiempo necesario para cumplir con:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Las finalidades del tratamiento</li>
                                                    <li>Obligaciones legales, contractuales y regulatorias</li>
                                                </ul>
                                                <p className="mt-2">En concordancia con el principio de temporalidad establecido en la Ley 1581 de 2012 y demás normas aplicables.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">9. Firma electrónica y validez jurídica</h4>
                                                <p>Las partes acuerdan que el presente formulario podrá ser suscrito mediante firma electrónica, conforme a lo dispuesto en:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>La Ley 527 de 1999</li>
                                                    <li>El Decreto 2364 de 2012</li>
                                                </ul>
                                                <p className="mt-2">En este sentido:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>La firma electrónica tendrá los mismos efectos jurídicos y probatorios que la firma manuscrita</li>
                                                    <li>Se considerará auténtica, íntegra y vinculante</li>
                                                    <li>El documento electrónico tendrá plena validez y fuerza probatoria</li>
                                                </ul>
                                                <p className="mt-2">El proveedor acepta expresamente que la carga de su firma (imagen digital o mecanismo electrónico) constituye una manifestación válida de su consentimiento.</p>
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-[#254153] mb-2 uppercase">10. Manifestación final de aceptación</h4>
                                                <p>Mediante la aceptación de estos Términos y Condiciones y el envío del formulario, el proveedor:</p>
                                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                                    <li>Declara la veracidad de la información suministrada</li>
                                                    <li>Autoriza el tratamiento de sus datos personales</li>
                                                    <li>Acepta la validación y verificación de la información</li>
                                                    <li>Reconoce la validez de la firma electrónica</li>
                                                    <li>Acepta quedar vinculado jurídicamente a lo aquí establecido</li>
                                                </ul>
                                            </section>
                                        </div>
                                        <button
                                            onClick={() => setShowTermsModal(false)}
                                            className="mt-6 w-full py-3 bg-[#254153] text-white rounded-xl font-semibold shadow-lg shadow-[#254153]/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                        >
                                            Cerrar y volver al formulario
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(4)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    loading || 
                                    !formData.acepta_terminos || 
                                    !formData.rut || 
                                    !formData.documento_identidad || 
                                    !formData.cert_bancaria || 
                                    !formData.firma ||
                                    !formData.referencias_comerciales ||
                                    (tipoContraparte === 'persona_juridica' && (
                                        !formData.camara_comercio || 
                                        !formData.estados_financieros || 
                                        !formData.doc_identidad_rep_legal || 
                                        !formData.composicion_accionaria || 
                                        !formData.certificado_arl_sst
                                    ))
                                }
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        {loadingText}
                                    </span>
                                ) : (
                                    'Enviar Formulario'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

// Componentes auxiliares
function Input({ label, name, type = 'text', value, onChange, className = '' }: any) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153] focus:border-transparent"
            />
        </div>
    )
}

function Select({ label, name, value, onChange, options }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
            </label>
            <select
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153]"
            >
                <option value="">Seleccione...</option>
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    )
}

function Checkbox({ label, name, checked, onChange }: any) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked || false}
                onChange={(e) => onChange(name, e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#254153] focus:ring-[#254153]"
            />
            <span className="text-gray-700">{label}</span>
        </label>
    )
}

function FileInput({ label, name, onChange, optional = false }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {!optional && <span className="text-red-500">*</span>}
                {optional && <span className="text-gray-400 font-normal"> (Opcional)</span>}
            </label>
            <input
                type="file"
                accept=".pdf"
                name={name}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onChange(name, file)
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#254153] file:text-white file:font-medium cursor-pointer"
            />
        </div>
    )
}

