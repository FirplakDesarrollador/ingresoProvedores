'use client'

import { useState, useEffect, Suspense } from 'react'
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
            const result = await submitProveedorForm({
                ...formData,
                tipo_solicitud: 'Nuevo Registro',
                tipo_contraparte: tipoContraparte as any
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

                        <Checkbox
                            label="Acepto los términos y condiciones, autorizo el tratamiento de datos personales"
                            name="acepta_terminos"
                            checked={formData.acepta_terminos}
                            onChange={updateField}
                        />

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
