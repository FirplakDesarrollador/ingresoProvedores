'use client'

import { useEffect, useState } from 'react'

interface Props {
    proveedor: any
}

export default function DocumentPreview({ proveedor }: Props) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return { day: '', month: '', year: '' }
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return { day: '', month: '', year: '' }
            return {
                day: d.getUTCDate().toString().padStart(2, '0'),
                month: (d.getUTCMonth() + 1).toString().padStart(2, '0'),
                year: d.getUTCFullYear().toString()
            }
        } catch {
            return { day: '', month: '', year: '' }
        }
    }

    const { day: dD, month: dM, year: dY } = formatDate(proveedor.fecha_diligenciamiento || proveedor.created_at || new Date().toISOString())
    const { day: nD, month: nM, year: nY } = formatDate(proveedor.fecha_nacimiento)
    const { day: eD, month: eM, year: eY } = formatDate(proveedor.fecha_expedicion)

    const Box = ({ checked }: { checked?: boolean }) => (
        <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[10px] font-bold bg-white leading-none">
            {checked ? 'X' : ''}
        </div>
    )

    const Field = ({ label, value, className = "", sublabel = "" }: { label: string, value?: any, className?: string, sublabel?: string }) => (
        <div className={`border border-black p-1 flex flex-col min-h-[36px] bg-white ${className}`}>
            <div className="flex justify-between items-start mb-0.5">
                <span className="text-[6.5px] uppercase font-bold leading-tight">{label}</span>
                {sublabel && <span className="text-[5px] text-gray-500 italic lowercase">{sublabel}</span>}
            </div>
            <span className="text-[9px] uppercase font-medium truncate h-4">{value || ''}</span>
        </div>
    )

    const SectionHeader = ({ title, number }: { title: string, number: string }) => (
        <div className="bg-[#254153] text-white text-[9px] font-bold p-1 border border-black uppercase mt-1">
            ({number}) {title}
        </div>
    )

    const isPdf = (url: string | null) => {
        if (!url) return false
        const pathOnly = url.split('?')[0]
        return pathOnly.toLowerCase().endsWith('.pdf')
    }
    
    const hasDoc = (label: string) => {
        if (!proveedor.documentos_subidos) return false
        const normalized = label.trim().toUpperCase()
        return proveedor.documentos_subidos.some((d: string) => d.trim().toUpperCase() === normalized)
    }

    return (
        <div className="bg-white p-8 shadow-2xl max-w-[21cm] mx-auto text-black font-sans leading-tight border border-gray-200">
            {/* Header Table */}
            <div className="border-2 border-black mb-1 p-2 flex justify-between items-center bg-[#f8f9fa]">
                <div className="w-1/4 flex flex-col items-center">
                    <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
                        <text x="5" y="22" fontFamily="Arial Black, sans-serif" fontSize="18" fill="#254153" letterSpacing="-1">FIRPLAK</text>
                        <rect x="5" y="25" width="85" height="1" fill="#254153" />
                    </svg>
                    <div className="text-[6px] uppercase font-bold text-[#254153] tracking-widest mt-0.5">Inspirando hogares</div>
                </div>
                <div className="w-1/2 text-center">
                    <h1 className="font-bold text-xs uppercase leading-tight border-b border-black pb-1 mb-1">
                        FORMULARIO DE CONOCIMIENTO DE CONTRAPARTES
                    </h1>
                    <p className="text-[6px] text-justify leading-none px-2">
                        Esta información es estrictamente confidencial y será utilizada únicamente para cumplir con las disposiciones establecidas en la Circular Externa No. 100-000016 del 24 de diciembre de 2020 relacionada con el Autocontrol y Gestión del Riesgo Integral LA/FT/FPADM y con la Ley 1581 de 2012 de Protección de Datos Personales.
                    </p>
                </div>
                <div className="w-1/4 text-right">
                    <div className="text-[7px] font-bold uppercase mb-1">Fecha de Diligenciamiento</div>
                    <div className="text-[8px] font-bold border border-black inline-block px-2 py-0.5 bg-white">{dD}/{dM}/{dY}</div>
                    <div className="text-[5px] font-medium text-gray-500 mt-1">FR-SAGRILAFT-V4.0</div>
                </div>
            </div>

            {/* Step 0: Meta info */}
            <div className="grid grid-cols-12 mb-1">
                <div className="col-span-4 border border-black p-1 flex flex-col justify-center bg-gray-50">
                    <span className="text-[7px] font-bold uppercase mb-1">Tipo de Solicitud:</span>
                    <div className="flex gap-4 text-[8px]">
                        <div className="flex items-center gap-1"><Box checked={true} /> VINCULACIÓN</div>
                        <div className="flex items-center gap-1"><Box /> ACTUALIZACIÓN</div>
                    </div>
                </div>
                <div className="col-span-8 border border-black border-l-0 p-1 flex flex-col justify-center bg-gray-50">
                    <span className="text-[7px] font-bold uppercase mb-1">Tipo de Contraparte (Seleccione una):</span>
                    <div className="flex gap-4 text-[8px]">
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'persona_natural'} /> P. NATURAL</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'persona_juridica'} /> P. JURÍDICA</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'empleado'} /> EMPLEADO</div>
                        <div className="flex items-center gap-1"><Box /> OTRO</div>
                    </div>
                </div>
            </div>

            {/* (1.1) Información General - Persona Natural */}
            <SectionHeader title="Información General - Persona Natural" number="1.1" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Primer Apellido" value={proveedor.primer_apellido} className="col-span-3 border-l-0 border-t-0" />
                <Field label="Segundo Apellido" value={proveedor.segundo_apellido} className="col-span-3 border-t-0" />
                <Field label="Primer Nombre" value={proveedor.primer_nombre} className="col-span-3 border-t-0" />
                <Field label="Segundo Nombre" value={proveedor.segundo_nombre} className="col-span-3 border-r-0 border-t-0" />
                
                <div className="col-span-3 border border-black border-l-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Tipo Documento</span>
                    <div className="flex gap-2 text-[8px] mt-1 justify-center">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('Cédula de Ciudadanía') || proveedor.tipo_documento?.includes('CC')} /> CC</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('Cédula de Extranjería') || proveedor.tipo_documento?.includes('CE')} /> CE</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('Pasaporte') || proveedor.tipo_documento?.includes('PAS')} /> PAS</div>
                        <div className="flex items-center gap-0.5"><Box /> OTRO</div>
                    </div>
                </div>
                <Field label="Número Identificación" value={proveedor.numero_identificacion} className="col-span-3 border-l-0" />
                <div className="col-span-3 border border-black p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Fecha Expedición</span>
                    <div className="flex text-center text-[9px] mt-1">
                        <div className="flex-1 border-r border-black">{eD}</div>
                        <div className="flex-1 border-r border-black">{eM}</div>
                        <div className="flex-1">{eY}</div>
                    </div>
                </div>
                <Field label="Lugar Expedición" value={proveedor.lugar_expedicion} className="col-span-3 border-r-0" />
                
                <Field label="Dirección de Residencia" value={proveedor.direccion} className="col-span-6 border-l-0" />
                <Field label="País / Departamento" value={`${proveedor.pais || ''} - ${proveedor.departamento || ''}`} className="col-span-3" />
                <Field label="Ciudad" value={proveedor.ciudad || ''} className="col-span-3 border-r-0" />
                
                <Field label="E-mail" value={proveedor.email} className="col-span-4 border-l-0" />
                <Field label="Celular" value={proveedor.celular} className="col-span-4" />
                <Field label="Profesión / Oficio" value={proveedor.profesion} className="col-span-4 border-r-0" />

                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase">
                    (1.1.2) Información PEP y SARLAFT (Persona Expuesta Políticamente)
                </div>
                <div className="col-span-12 grid grid-cols-4 border-t border-black text-[6.5px]">
                    <div className="border-r border-black p-1 flex flex-col justify-between">
                        <span>¿Es persona expuesta políticamente?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.es_pep} /> NO <Box checked={!proveedor.es_pep} /></div>
                    </div>
                    <div className="border-r border-black p-1 flex flex-col justify-between">
                        <span>¿Maneja recursos públicos?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.administra_recursos_publicos} /> NO <Box checked={!proveedor.administra_recursos_publicos} /></div>
                    </div>
                    <div className="border-r border-black p-1 flex flex-col justify-between">
                        <span>¿Tiene grado de poder público?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_grado_poder_publico} /> NO <Box checked={!proveedor.tiene_grado_poder_publico} /></div>
                    </div>
                    <div className="p-1 flex flex-col justify-between">
                        <span>¿Vínculo con un PEP?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_vinculo_pep} /> NO <Box checked={!proveedor.tiene_vinculo_pep} /></div>
                    </div>
                    <div className="col-span-2 border-r border-t border-black p-1 flex flex-col justify-between">
                        <span>¿Tiene reconocimiento público?</span>
                        <div className="flex gap-2 items-center">
                            SI <Box checked={proveedor.tiene_reconocimiento_publico} /> NO <Box checked={!proveedor.tiene_reconocimiento_publico} />
                            <span className="ml-4 italic text-[6px]">¿Cuál?: __________________________</span>
                        </div>
                    </div>
                    <div className="col-span-2 border-t border-black p-1 flex flex-col justify-between">
                        <span>Investigaciones / Sanciones LA/FT</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_sanciones_lavado === 'Sí' || proveedor.tiene_sanciones_lavado === true} /> NO <Box checked={proveedor.tiene_sanciones_lavado === 'No' || proveedor.tiene_sanciones_lavado === false} /></div>
                    </div>
                </div>
            </div>

            {/* (1.2) Persona Jurídica */}
            <SectionHeader title="Información Persona Jurídica" number="1.2" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Razón Social" value={proveedor.razon_social} className="col-span-8 border-l-0 border-t-0" />
                <Field label="NIT / RUT" value={proveedor.numero_identificacion} className="col-span-4 border-r-0 border-t-0" />
                
                <div className="col-span-6 border border-black border-l-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Tipo de Sociedad:</span>
                    <div className="flex gap-2 text-[6.5px] mt-1">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Anónima'} /> ANÓNIMA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'S.A.S.'} /> S.A.S.</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Limitada'} /> LIMITADA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Otra'} /> OTRO</div>
                    </div>
                </div>
                <div className="col-span-6 border border-black border-r-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Origen de Capital:</span>
                    <div className="flex gap-4 text-[6.5px] mt-1">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Privada'} /> PRIVADA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Pública'} /> PÚBLICA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Mixta'} /> MIXTA</div>
                    </div>
                </div>
                
                <Field label="Código CIIU" value={proveedor.codigo_ciiu} className="col-span-3 border-l-0" />
                <Field label="Ciudad / Sede Principal" value={proveedor.ciudad} className="col-span-4" />
                <Field label="Dirección Oficina" value={proveedor.direccion} className="col-span-5 border-r-0" />

                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase flex justify-between">
                    <span>(1.2.3) Representante Legal y Cumplimiento</span>
                    <span>(1.2.4) Sistemas de Gestión</span>
                </div>
                <Field label="Nombre Completo Rep. Legal" value={proveedor.rep_legal_nombre_completo} className="col-span-7 border-l-0" />
                <Field label="Cédula Rep. Legal" value={proveedor.rep_legal_numero_identificacion} className="col-span-3" />
                <div className="col-span-2 border border-black border-r-0 p-1 bg-white flex flex-col justify-center">
                    <span className="text-[5.5px] font-bold uppercase leading-none mb-1 text-center">Evaluación SST soporte adjunto:</span>
                    <div className="flex gap-2 justify-center mt-1">SI <Box checked={proveedor.tiene_evaluacion_sst === 'Sí' || proveedor.tiene_evaluacion_sst === true} /> NO <Box checked={proveedor.tiene_evaluacion_sst === 'No' || proveedor.tiene_evaluacion_sst === false} /></div>
                </div>
            </div>

            {/* (1.3) Información Financiera */}
            <SectionHeader title="Información Financiera" number="1.3" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Total Activos" value={proveedor.total_activos ? `$ ${Number(proveedor.total_activos).toLocaleString()}` : ''} className="col-span-3 border-l-0 border-t-0" />
                <Field label="Total Pasivos" value={proveedor.total_pasivos ? `$ ${Number(proveedor.total_pasivos).toLocaleString()}` : ''} className="col-span-3 border-t-0" />
                <Field label="Total Patrimonio" value={proveedor.total_patrimonio ? `$ ${Number(proveedor.total_patrimonio).toLocaleString()}` : ''} className="col-span-3 border-t-0" />
                <Field label="Ingresos Mensuales" value={proveedor.ingresos_mensuales ? `$ ${Number(proveedor.ingresos_mensuales).toLocaleString()}` : ''} className="col-span-3 border-r-0 border-t-0" />
                
                <Field label="Otros Ingresos Mensuales" value={proveedor.otros_ingresos_mensuales ? `$ ${Number(proveedor.otros_ingresos_mensuales).toLocaleString()}` : ''} className="col-span-4 border-l-0" />
                <Field label="Concepto Otros Ingresos" value={proveedor.concepto_otros_ingresos} className="col-span-4" />
                <Field label="Egresos Mensuales" value={proveedor.egresos_mensuales ? `$ ${Number(proveedor.egresos_mensuales).toLocaleString()}` : ''} className="col-span-4 border-r-0" />
                
                <div className="col-span-4 border border-black border-l-0 p-1 bg-white flex justify-between items-center min-h-[30px]">
                    <span className="text-[6.5px] font-bold uppercase leading-tight">¿Posee Activos Virtuales? (Cripto):</span>
                    <div className="flex gap-2 text-[8px] mr-2">SI <Box checked={proveedor.posee_activos_virtuales === true} /> NO <Box checked={proveedor.posee_activos_virtuales === false} /></div>
                </div>
                <Field label="Fecha Corte Inf. Financiera" value={proveedor.fecha_corte_info_financiera} className="col-span-8 border-r-0" />
            </div>

            {/* (1.4) Información Bancaria y Facturación */}
            <SectionHeader title="Información Bancaria y Facturación" number="1.4" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <div className="col-span-3 border border-black border-l-0 border-t-0 p-1 bg-white flex items-center justify-between">
                    <span className="text-[6.5px] font-bold block uppercase">Tipo Cuenta:</span>
                    <div className="flex gap-2 text-[7px]">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_cuenta === 'Corriente'} /> CORR</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_cuenta === 'Ahorros'} /> AHOR</div>
                    </div>
                </div>
                <Field label="Entidad Bancaria" value={proveedor.entidad_bancaria} className="col-span-4 border-t-0" />
                <Field label="Número de Cuenta" value={proveedor.numero_cuenta} className="col-span-5 border-r-0 border-t-0" />
                
                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase">
                    (1.5) Facturación Electrónica (DIAN)
                </div>
                <Field label="Email Factura Electrónica" value={proveedor.correo_facturacion} className="col-span-7 border-l-0" />
                <Field label="Persona Contacto DIAN" value="" className="col-span-3" />
                <Field label="Tel: Contacto" value="" className="col-span-2 border-r-0" />
            </div>

            {/* (1.6) Operaciones Internacionales */}
            <SectionHeader title="Operaciones Internacionales" number="1.6" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black bg-white">
                <div className="col-span-4 border border-black border-l-0 border-t-0 p-1 flex justify-between items-center bg-gray-50/10">
                    <span className="text-[6.5px] font-bold uppercase leading-tight">¿Operaciones Moneda Extranjera?</span>
                    <div className="flex gap-2 mr-2">SI <Box checked={proveedor.realiza_operaciones_internacionales === 'Sí' || proveedor.realiza_operaciones_internacionales === true} /> NO <Box checked={proveedor.realiza_operaciones_internacionales === 'No' || proveedor.realiza_operaciones_internacionales === false} /></div>
                </div>
                <div className="col-span-8 border border-black border-r-0 border-t-0 p-1">
                    <span className="text-[5.5px] font-semibold uppercase block mb-1">Propósitos de las Transacciones (Marcar si aplica):</span>
                    <div className="flex gap-4 text-[6.5px] flex-wrap justify-between px-2">
                        <div className="flex items-center gap-1"><Box /> Importaciones</div>
                        <div className="flex items-center gap-1"><Box /> Exportaciones</div>
                        <div className="flex items-center gap-1"><Box /> Inversiones</div>
                        <div className="flex items-center gap-1"><Box /> Otros: _______________</div>
                    </div>
                </div>
            </div>

            {/* (1.7) Declaración Origen de Fondos */}
            <SectionHeader title="Declaración de Origen de Fondos (SAGRILAFT)" number="1.7" />
            <div className="border border-black p-2 text-[6.5px] leading-tight text-justify bg-white">
                <p className="mb-1 font-semibold border-b border-gray-100 pb-1">
                    Declaro expresamente que: El contenido de esta información es veraz y verificable, realizo la siguiente declaración 
                    de fuente de bienes y fondos a FIRPLAK SA:
                </p>
                <div className="grid grid-cols-1 gap-1 pt-1">
                    <p><strong>1).</strong> Los bienes provienen de: <span className="underline decoration-dotted">{proveedor.detalle_origen_fondos || '____________________________'}</span></p>
                    <p><strong>2).</strong> Mi actividad es lícita y la ejerzo dentro del marco legal. Los recursos no provienen de actividades ilícitas (Lavado de Activos / FT).</p>
                    <p><strong>3).</strong> Me obligo a actualizar esta información anualmente o ante cambios en la composición accionaria o representación legal.</p>
                    <p><strong>4).</strong> Autorizo a Firplak SA para consultar bases de datos vinculadas con el riesgo LA/FT/FPADM.</p>
                    <p><strong>5).</strong> Firplak SA queda facultado para terminar la relación comercial ante cualquier reporte negativo en listas vinculantes.</p>
                </div>
            </div>

            {/* (1.8) Firma */}
            <div className="mt-1 border-2 border-black bg-white p-2">
                <div className="grid grid-cols-12 gap-10 mt-2">
                    <div className="col-span-12 flex flex-col items-center">
                        <div className="w-[300px] flex justify-center mb-1 min-h-[85px] items-center border border-dashed border-gray-300 bg-gray-50/50 relative overflow-hidden">
                            {proveedor.firma_url ? (
                                <img 
                                    src={proveedor.firma_url} 
                                    alt="Firma" 
                                    className="max-h-20 object-contain mix-blend-multiply" 
                                />
                            ) : (
                                <div className="text-[8px] text-gray-400 italic font-medium uppercase tracking-widest opacity-30">Espacio exclusivo para Firma</div>
                            )}
                        </div>
                        <div className="w-[300px] border-t-2 border-black mb-1"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black uppercase text-[#254153]">FIRMA REPRESENTANTE LEGAL / PROVEEDOR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* (1.9) Documentos Adjuntos Checklist */}
            <div className="mt-1 border border-black bg-white p-1">
                <div className="bg-[#254153] text-white text-[8px] font-bold p-1 uppercase">
                   (1.9) Lista de Chequeo - Documentos Verificados en Registro
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 p-2 text-[6.5px]">
                    <div className="flex items-center gap-2"><Box checked={hasDoc('rut')} /> RUT Actualizado</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('documento_identidad')} /> Cédula Rep. Natural</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('cert_bancaria')} /> Certificación Bancaria</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('camara_comercio')} /> Cámara de Comercio</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('estados_financieros')} /> Estados Financieros</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('doc_identidad_rep_legal')} /> Cédula Rep. Legal</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('composicion_accionaria')} /> Composición Accionaria</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('certificado_arl_sst')} /> Autodiagnóstico SST</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('referencias_comerciales')} /> Ref. Comerciales</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('certificado_sagrilaft')} /> Cert. SAGRILAFT</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('otros_documentos')} /> Otros Documentos</div>
                    <div className="flex items-center gap-2"><Box /> Otros: _______________</div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 flex justify-between items-center text-[5px] text-gray-400 border-t border-gray-200 pt-1 italic">
                <span>FIRPLAK SA | NIT 890.931.228-5 | Medellín, Colombia</span>
                <span className="font-bold">FR-SAGRILAFT-SST-V4.2 | 2026</span>
                <span>Página 1 de 1</span>
            </div>
        </div>
    )
}
