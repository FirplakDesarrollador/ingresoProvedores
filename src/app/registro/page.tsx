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
    const [tipoContraparte, setTipoContraparte] = useState<TipoContraparte>('')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [showTermsModal, setShowTermsModal] = useState(false)

    useEffect(() => {
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
            // 1. Submit basic data
            // 1. Submit basic data (exclude files and signature from the metadata insert)
            const { 
                firma, 
                metodo_firma, 
                rut, 
                documento_identidad, 
                cert_bancaria, 
                camara_comercio, 
                estados_financieros,
                ...cleanFormData 
            } = formData
            
            const result = await submitProveedorForm({
                ...cleanFormData,
                tipo_solicitud: 'Nuevo Registro',
                tipo_contraparte: tipoContraparte as any,
                detalle_origen_fondos: formData.detalle_origen_fondos || null
            })

            if (result.success && result.id) {
                const proveedorId = result.id

                // 2. Upload files
                const fileFields = ['rut', 'documento_identidad', 'cert_bancaria', 'camara_comercio', 'estados_financieros']
                for (const field of fileFields) {
                    const file = formData[field]
                    if (file instanceof File) {
                        const label = field.replace(/_/g, ' ').toUpperCase()
                        await uploadDocument(proveedorId, label, file)
                    }
                }

                // 3. Upload signature
                if (formData.firma) {
                    let signatureFile: File;
                    if (typeof formData.firma === 'string' && formData.firma.startsWith('data:')) {
                        // Convert base64 to File
                        const response = await fetch(formData.firma);
                        const blob = await response.blob();
                        signatureFile = new File([blob], 'firma.png', { type: 'image/png' });
                    } else {
                        signatureFile = formData.firma;
                    }
                    await uploadDocument(proveedorId, 'FIRMA', signatureFile);
                }

                router.push('/registro/exito')
            } else {
                alert('Error al registrar: ' + (result as any).error)
            }
        } catch (e) {
            console.error(e)
            alert('Error inesperado')
        }
        setLoading(false)
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
                                    'Logística', 
                                    'Manufactura', 
                                    'Compras y Negociación', 
                                    'Talento Humano', 
                                    'TI', 
                                    'Almacén', 
                                    'Otro'
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
                                <Input label="Correo Facturación" name="correo_facturacion" type="email" value={formData.correo_facturacion} className="col-span-2" onChange={updateField} />
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>
                            <button 
                                onClick={() => setStep(getNextStep(2))} 
                                disabled={
                                    tipoContraparte === 'persona_juridica' 
                                    ? (!formData.razon_social || !formData.numero_identificacion || !formData.codigo_ciiu || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion))
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
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>
                            <button onClick={() => setStep(4)} className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold">Continuar</button>
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
                                    <Input label="Ingresos Mensuales" name="ingresos_mensuales" type="number" value={formData.ingresos_mensuales} onChange={updateField} />
                                    <Input label="Egresos Mensuales" name="egresos_mensuales" type="number" value={formData.egresos_mensuales} onChange={updateField} />
                                </>
                            )}

                            {/* Campos bancarios para todos */}
                            <Select label="Tipo de Cuenta" name="tipo_cuenta" value={formData.tipo_cuenta} onChange={updateField} options={['Ahorros', 'Corriente']} />
                            <Input label="Entidad Bancaria" name="entidad_bancaria" value={formData.entidad_bancaria} onChange={updateField} />
                            <Input label="Número de Cuenta" name="numero_cuenta" value={formData.numero_cuenta} onChange={updateField} />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(getPrevStep(4))} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>

                            {tipoContraparte === 'empleado' ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta}
                                    className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Formulario'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setStep(5)} 
                                    disabled={!formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta || !formData.total_activos || !formData.total_pasivos || !formData.ingresos_mensuales || !formData.egresos_mensuales}
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
                                        <li>• Balances (2 últimos años)</li>
                                        <li>• Certificación bancaria</li>
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

                        <div className="space-y-4 mb-6">
                            <FileInput label="RUT" name="rut" onChange={updateField} />
                            <FileInput label="Documento de Identidad" name="documento_identidad" onChange={updateField} />
                            <FileInput label="Certificación Bancaria" name="cert_bancaria" onChange={updateField} />
                            {tipoContraparte === 'persona_juridica' && (
                                <>
                                    <FileInput label="Cámara de Comercio" name="camara_comercio" onChange={updateField} />
                                    <FileInput label="Estados Financieros" name="estados_financieros" onChange={updateField} />
                                </>
                            )}
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
                            
                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateField('metodo_firma', 'dibujar');
                                        updateField('firma', null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!formData.metodo_firma || formData.metodo_firma === 'dibujar' 
                                        ? 'bg-[#254153] text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Dibujar firma
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateField('metodo_firma', 'subir');
                                        updateField('firma', null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${formData.metodo_firma === 'subir' 
                                        ? 'bg-[#254153] text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Subir imagen
                                </button>
                            </div>

                            {(!formData.metodo_firma || formData.metodo_firma === 'dibujar') ? (
                                <SignaturePad 
                                    onSave={(signature: string) => updateField('firma', signature)} 
                                    onClear={() => updateField('firma', null)}
                                />
                            ) : (
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
                            )}
                        </div>

                        <Checkbox
                            label={
                                <>
                                    Acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#254153] font-semibold underline hover:text-[#3a5d75]">términos y condiciones</button>, autorizo el tratamiento de datos personales
                                </>
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
                                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="bg-[#254153] p-4 text-white flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Términos y Condiciones</h3>
                                        <button 
                                            onClick={() => setShowTermsModal(false)}
                                            className="p-1 hover:bg-white/10 rounded-full transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-8">
                                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 text-center">
                                            <p className="text-gray-500 font-medium italic">Pendiente</p>
                                        </div>
                                        <div className="mt-8 text-gray-600 text-sm leading-relaxed">
                                            <p>Este contenido se actualizará próximamente con los términos legales vigentes de Firplak SA.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowTermsModal(false)}
                                            className="mt-8 w-full py-3 bg-[#254153] text-white rounded-xl font-semibold shadow-lg shadow-[#254153]/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                        >
                                            Entendido
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
                                    (tipoContraparte === 'persona_juridica' && (!formData.camara_comercio || !formData.estados_financieros))
                                }
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Formulario'}
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

function FileInput({ label, name, onChange }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
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

function SignaturePad({ onSave, onClear }: { onSave: (sig: string) => void, onClear: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.lineWidth = 2
        ctx.strokeStyle = '#000'
        
        // Prevent scrolling when touching the canvas
        const preventDefault = (e: TouchEvent) => {
            if (e.target === canvas) e.preventDefault()
        }
        document.body.addEventListener('touchstart', preventDefault, { passive: false })
        document.body.addEventListener('touchend', preventDefault, { passive: false })
        document.body.addEventListener('touchmove', preventDefault, { passive: false })
        
        return () => {
            document.body.removeEventListener('touchstart', preventDefault)
            document.body.removeEventListener('touchend', preventDefault)
            document.body.removeEventListener('touchmove', preventDefault)
        }
    }, [])

    const getCoordinates = (e: any) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const startDrawing = (e: any) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const { x, y } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: any) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const { x, y } = getCoordinates(e)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false)
            if (canvasRef.current) {
                onSave(canvasRef.current.toDataURL())
            }
        }
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onClear()
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
                ref={canvasRef}
                width={700}
                height={250}
                className="w-full bg-white touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="bg-gray-50 border-t border-gray-300 p-2 flex justify-end">
                <button 
                    type="button" 
                    onClick={clear}
                    className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1 bg-white border border-gray-200 rounded shadow-sm transition-colors"
                >
                    Limpiar firma
                </button>
            </div>
        </div>
    )
}
