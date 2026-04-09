'use client'

import PrintButton from './PrintButton'

interface Props {
    proveedor: any
}

export default function PdfClient({ proveedor }: Props) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return { day: '', month: '', year: '' }
        try {
            const d = new Date(dateStr)
            return {
                day: d.getUTCDate().toString().padStart(2, '0'),
                month: (d.getUTCMonth() + 1).toString().padStart(2, '0'),
                year: d.getUTCFullYear().toString()
            }
        } catch {
            return { day: '', month: '', year: '' }
        }
    }

    const { day: dD, month: dM, year: dY } = formatDate(proveedor.fecha_diligenciamiento || proveedor.created_at)
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
        // Eliminar parámetros de búsqueda si los hay (e.g. ?token=...)
        const pathOnly = url.split('?')[0]
        return pathOnly.toLowerCase().endsWith('.pdf')
    }
    
    // Función para verificar si un documento fue subido
    const hasDoc = (label: string) => {
        if (!proveedor.documentos_subidos) return false
        const normalized = label.trim().toUpperCase()
        return proveedor.documentos_subidos.some((d: string) => d.trim().toUpperCase() === normalized)
    }

    return (
        <div className="bg-white p-4 max-w-[21cm] mx-auto text-black font-sans leading-tight print:p-0">
            {/* Header Table */}
            <div className="border-2 border-black mb-1 p-2 flex justify-between items-center bg-[#f8f9fa]">
                <div className="w-1/4 flex flex-col items-center">
                    {/* SVG Stylized Logo FIRPLAK */}
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
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('CC')} /> CC</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('CE')} /> CE</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('PAS')} /> PAS</div>
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
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_sanciones_lavado} /> NO <Box checked={!proveedor.tiene_sanciones_lavado} /></div>
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
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Otro'} /> OTRO</div>
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
                    <div className="flex gap-2 justify-center mt-1">SI <Box checked={proveedor.tiene_evaluacion_sst} /> NO <Box checked={!proveedor.tiene_evaluacion_sst} /></div>
                </div>

                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase">
                    (1.2.5) Información Tributaria (Régimen)
                </div>
                <div className="col-span-12 grid grid-cols-4 border-t border-black text-[6.5px] bg-white">
                    <div className="border-r border-black p-1 flex justify-between items-center bg-gray-50/20">
                        <span>Gran Contribuyente</span>
                        <div className="flex gap-1">SI <Box /> NO <Box /></div>
                    </div>
                    <div className="border-r border-black p-1 flex justify-between items-center bg-gray-50/20">
                        <span>Responsable de IVA</span>
                        <div className="flex gap-1">SI <Box /> NO <Box checked={true} /></div>
                    </div>
                    <div className="border-r border-black p-1 flex justify-between items-center bg-gray-50/20">
                        <span>Autorretenedor</span>
                        <div className="flex gap-1">SI <Box /> NO <Box /></div>
                    </div>
                    <div className="p-1 flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-1 font-semibold uppercase text-[5.5px]"><Box /> Régimen Simplificado</div>
                        <div className="flex items-center gap-1 font-semibold uppercase text-[5.5px]"><Box /> Régimen Común</div>
                    </div>
                </div>
            </div>

            {/* Contacts Section (User explicitly requested these) */}
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black bg-white mt-1">
                <div className="col-span-12 p-1 text-[7px] font-bold uppercase border-b border-black bg-gray-50">Contactos de la Organización</div>
                <Field label="Contacto Comercial" value="" className="col-span-4 border-l-0 border-t-0" />
                <Field label="Tel: Contacto Logística" value="" className="col-span-4 border-t-0" />
                <Field label="Contacto Contable" value="" className="col-span-4 border-r-0 border-t-0" />
                <Field label="Tel: Tesorería" value="" className="col-span-3 border-l-0" />
                <Field label="Tel: Contabilidad" value="" className="col-span-3" />
                <Field label="Dirección de Notificación" value="" className="col-span-6 border-r-0" />
            </div>

            {/* (1.3) Información Financiera */}
            <SectionHeader title="Información Financiera" number="1.3" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Total Activos (Millones)" value={proveedor.total_activos ? `$ ${Number(proveedor.total_activos).toLocaleString()}` : ''} className="col-span-3 border-l-0 border-t-0" />
                <Field label="Total Pasivos (Millones)" value={proveedor.total_pasivos ? `$ ${Number(proveedor.total_pasivos).toLocaleString()}` : ''} className="col-span-3 border-t-0" />
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
                <div className="col-span-12 p-1.5 text-[5.5px] text-justify leading-none border-t border-black bg-white italic">
                    Declaro que FIRPLAK SA está autorizado para facturarme electrónicamente según el Decreto 1625 de 2016. El no rechazo de la factura dentro de los 3 días hábiles siguientes a su recepción se entenderá como aceptación irrevocable de la misma (Art. 2.2.2.53.2).
                </div>
            </div>

            {/* (1.6) Operaciones Internacionales */}
            <SectionHeader title="Operaciones Internacionales" number="1.6" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black bg-white">
                <div className="col-span-4 border border-black border-l-0 border-t-0 p-1 flex justify-between items-center bg-gray-50/10">
                    <span className="text-[6.5px] font-bold uppercase leading-tight">¿Operaciones Moneda Extranjera?</span>
                    <div className="flex gap-2 mr-2">SI <Box checked={proveedor.realiza_operaciones_internacionales === true} /> NO <Box checked={proveedor.realiza_operaciones_internacionales === false} /></div>
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

            {/* (1.8) Firma y Autorización Habeas Data y Centrales de Riesgo */}
            <div className="mt-1 border-2 border-black bg-white p-2">
                <div className="text-[6px] text-justify leading-[1.1] space-y-1">
                    <p>
                        Autorizo a <strong>Firplak SA</strong> para reportar, consultar y/o divulgar ante centrales de riesgo legalmente constituidas, datos sobre el cumplimiento o incumplimiento, si lo hubiere, de 
                        obligaciones crediticias o deberes patrimoniales, conforme a lo establecido en la <strong>Ley 1266 de 2008</strong>. Esta autorización garantiza que dicha información sea veraz, pertinente, 
                        completa, actualizada y exacta. La autorización subsistirá hasta que el proveedor deudor esté a paz y salvo con Firplak SA por todo concepto, incluso si el contrato ha 
                        finalizado.
                    </p>
                    <p>
                        En cumplimiento de la <strong>Ley 1581 de 2012, la Ley 1266 de 2008</strong> y sus decretos reglamentarios, usted autoriza de manera previa, expresa e informada a <strong>Firplak SA</strong> para el 
                        Tratamiento de sus Datos Personales con las siguientes finalidades:
                        <span className="block pl-2 mt-0.5">
                            a. Cumplir con las obligaciones del contrato; b. Evaluar el cumplimiento de Compromisos; c. Gestión de cobros y pagos; 
                            d. Realizar los reportes (Entes de control - Centrales de Información); e. Gestión de Facturación; 
                            f. Marketing, ofrecimiento de productos y servicios; g. Publicidad propia; e. Procedimientos administrativos.
                        </span>
                    </p>
                    <p>
                        Responder preguntas sobre datos sensibles o menores es voluntario, y nunca se condicionará ninguna actividad a ello. El tratamiento de datos se rige por principios legales y 
                        éticos que garantizan seguridad, confidencialidad y uso legítimo. Como titular de los datos, usted puede conocer, actualizar, rectificar y suprimir su información personal, 
                        revocar la autorización, solicitar copias de esta y presentar quejas ante la Superintendencia de Industria y Comercio. Para ello, Firplak SA ha habilitado el correo: 
                        <strong> protecciondatos@firplak.com</strong>. Firplak SA podrá transmitir o transferir sus Datos Personales a terceros aliados o empresas del Grupo, dentro o fuera de 
                        países con medidas adecuadas de protección de datos.
                    </p>
                </div>
                
                <div className="grid grid-cols-12 gap-10 mt-2">
                    <div className="col-span-12 flex flex-col items-center">
                        <div className="w-[300px] flex justify-center mb-1 min-h-[85px] items-center border border-dashed border-gray-300 bg-gray-50/50 relative overflow-hidden">
                            {proveedor.firma_url ? (
                                isPdf(proveedor.firma_url) ? (
                                    <div className="text-[7px] text-[#254153] p-2 text-center uppercase font-bold bg-white/80 border border-[#254153]/20">
                                        Firma cargada como archivo PDF<br/>
                                        <span className="text-[5px] normal-case font-medium">Consultar adjunto en base de datos</span>
                                    </div>
                                ) : (
                                    <img 
                                        src={proveedor.firma_url} 
                                        alt="Firma" 
                                        className="max-h-20 object-contain mix-blend-multiply" 
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const div = document.createElement('div');
                                                div.className = "text-[7px] text-red-500 font-bold p-4 text-center";
                                                div.innerText = "Error cargando firma (Verifique conexión)";
                                                parent.appendChild(div);
                                            }
                                        }}
                                    />
                                )
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
                    <div className="flex items-center gap-2"><Box checked={hasDoc('RUT')} /> RUT Actualizado</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('DOCUMENTO IDENTIDAD')} /> Cédula Rep. Natural</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('CERT BANCARIA')} /> Certificación Bancaria</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('CAMARA COMERCIO')} /> Cámara de Comercio</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('ESTADOS FINANCIEROS')} /> Estados Financieros</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('DOC IDENTIDAD REP LEGAL')} /> Cédula Rep. Legal</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('COMPOSICION ACCIONARIA')} /> Composición Accionaria</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('CERTIFICADO ARL SST')} /> Autodiagnóstico SST</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('REFERENCIAS COMERCIALES')} /> Ref. Comerciales</div>
                    
                    <div className="flex items-center gap-2"><Box checked={hasDoc('CERTIFICADO SAGRILAFT')} /> Cert. SAGRILAFT</div>
                    <div className="flex items-center gap-2"><Box checked={hasDoc('OTROS DOCUMENTOS')} /> Otros Documentos</div>
                    <div className="flex items-center gap-2"><Box /> Otros: _______________</div>
                </div>
                <div className="text-[5px] text-center text-gray-400 mt-1 uppercase border-t border-gray-100 pt-1">
                    Validado digitalmente por el sistema Firplak - Fecha de registro: {proveedor.created_at}
                </div>
            </div>

            {/* Print Logic */}
            <PrintButton />

            {/* Footer / Version Control */}
            <div className="mt-3 flex justify-between items-center text-[5px] text-gray-400 border-t border-gray-200 pt-1 italic">
                <span>FIRPLAK SA | NIT 890.931.228-5 | Medellín, Colombia</span>
                <span className="font-bold">FR-SAGRILAFT-SST-V4.2 | 2026</span>
                <span>Página 1 de 1</span>
            </div>
        </div>
    )
}
