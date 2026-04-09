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

    return (
        <div className="bg-white p-4 max-w-[21cm] mx-auto text-black font-sans leading-tight print:p-0">
            {/* Header Table */}
            <div className="border-2 border-black mb-1 p-2 flex justify-between items-center bg-[#f8f9fa]">
                <div className="w-1/4 flex flex-col items-center">
                    <div className="font-black text-2xl text-[#254153] tracking-tighter">FIRPLAK</div>
                    <div className="text-[6px] uppercase font-bold text-gray-400">Inspirando hogares</div>
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
                    <div className="text-[7px] font-bold">FECHA: {dD}/{dM}/{dY}</div>
                    <div className="text-[6px] font-medium text-gray-500">Versión 2.0</div>
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

            {/* (1) Información General / Persona Natural */}
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
                <Field label="Ciudad / Departamento" value={`${proveedor.ciudad || ''} - ${proveedor.departamento || ''}`} className="col-span-3" />
                <Field label="Teléfono" value={proveedor.telefono1_numero} className="col-span-3 border-r-0" />
                
                <Field label="E-mail" value={proveedor.email} className="col-span-4 border-l-0" />
                <Field label="Celular" value={proveedor.celular} className="col-span-4" />
                <Field label="Profesión / Oficio" value={proveedor.profesion} className="col-span-4 border-r-0" />

                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase">
                    (1.1.2) Información PEP (Persona Expuesta Políticamente)
                </div>
                <div className="col-span-12 grid grid-cols-4 border-t border-black text-[7px]">
                    <div className="border-r border-black p-1 flex justify-between items-center h-8">
                        <span>¿Es persona expuesta políticamente?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.es_pep} /> NO <Box checked={!proveedor.es_pep} /></div>
                    </div>
                    <div className="border-r border-black p-1 flex justify-between items-center h-8">
                        <span>¿Maneja recursos públicos?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.administra_recursos_publicos} /> NO <Box checked={!proveedor.administra_recursos_publicos} /></div>
                    </div>
                    <div className="border-r border-black p-1 flex justify-between items-center h-8">
                        <span>¿Tiene grado de poder público?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_grado_poder_publico} /> NO <Box checked={!proveedor.tiene_grado_poder_publico} /></div>
                    </div>
                    <div className="p-1 flex justify-between items-center h-8">
                        <span>¿Vínculo con un PEP?</span>
                        <div className="flex gap-2">SI <Box checked={proveedor.tiene_vinculo_pep} /> NO <Box checked={!proveedor.tiene_vinculo_pep} /></div>
                    </div>
                </div>
            </div>

            {/* (1.2) Persona Jurídica */}
            <SectionHeader title="Información Persona Jurídica" number="1.2" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Razón Social" value={proveedor.razon_social} className="col-span-8 border-l-0 border-t-0" />
                <Field label="NIT" value={proveedor.numero_identificacion} className="col-span-4 border-r-0 border-t-0" />
                
                <div className="col-span-6 border border-black border-l-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Tipo de Sociedad:</span>
                    <div className="flex gap-2 text-[7px] mt-1">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Anónima'} /> ANÓNIMA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'S.A.S.'} /> S.A.S.</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Limitada'} /> LIMITADA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_sociedad === 'Otro'} /> OTRO</div>
                    </div>
                </div>
                <div className="col-span-6 border border-black border-r-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Origen de Capital:</span>
                    <div className="flex gap-4 text-[7px] mt-1">
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Privada'} /> PRIVADA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Pública'} /> PÚBLICA</div>
                        <div className="flex items-center gap-0.5"><Box checked={proveedor.origen_capital === 'Mixta'} /> MIXTA</div>
                    </div>
                </div>
                
                <Field label="Código CIIU" value={proveedor.codigo_ciiu} className="col-span-3 border-l-0" />
                <Field label="Ciudad Empresa" value={proveedor.ciudad} className="col-span-4" />
                <Field label="Dirección Oficina" value={proveedor.direccion} className="col-span-5 border-r-0" />

                <div className="col-span-12 bg-gray-50 border-t border-black p-1 text-[7px] font-bold uppercase">
                    (1.2.3) Representante Legal
                </div>
                <Field label="Nombre Completo Rep. Legal" value={proveedor.rep_legal_nombre_completo} className="col-span-8 border-l-0" />
                <Field label="Cédula Rep. Legal" value={proveedor.rep_legal_numero_identificacion} className="col-span-4 border-r-0" />
            </div>

            {/* (1.3) Información Financiera */}
            <SectionHeader title="Información Financiera" number="1.3" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <Field label="Total Activos" value={proveedor.total_activos ? `$ ${Number(proveedor.total_activos).toLocaleString()}` : ''} className="col-span-4 border-l-0 border-t-0" />
                <Field label="Total Pasivos" value={proveedor.total_pasivos ? `$ ${Number(proveedor.total_pasivos).toLocaleString()}` : ''} className="col-span-4 border-t-0" />
                <Field label="Ingresos Mensuales" value={proveedor.ingresos_mensuales ? `$ ${Number(proveedor.ingresos_mensuales).toLocaleString()}` : ''} className="col-span-4 border-r-0 border-t-0" />
                
                <Field label="Otros Ingresos" value="" className="col-span-4 border-l-0" />
                <Field label="Egresos Mensuales" value={proveedor.egresos_mensuales ? `$ ${Number(proveedor.egresos_mensuales).toLocaleString()}` : ''} className="col-span-4" />
                <div className="col-span-4 border border-black border-r-0 p-1 bg-white flex flex-col justify-center">
                    <span className="text-[6.5px] font-bold uppercase block mb-1">¿Realiza op. internacionales?</span>
                    <div className="flex gap-4 text-[8px] justify-center">
                        <div className="flex items-center gap-1">SI <Box checked={proveedor.realiza_operaciones_internacionales === true} /></div>
                        <div className="flex items-center gap-1">NO <Box checked={proveedor.realiza_operaciones_internacionales === false} /></div>
                    </div>
                </div>
            </div>

            {/* (1.4) Información Bancaria */}
            <SectionHeader title="Información Bancaria" number="1.4" />
            <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
                <div className="col-span-4 border border-black border-l-0 border-t-0 p-1 bg-white">
                    <span className="text-[6.5px] font-bold block uppercase">Tipo de Cuenta:</span>
                    <div className="flex gap-4 text-[8px] mt-1 justify-center">
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_cuenta === 'Corriente'} /> CORRIENTE</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_cuenta === 'Ahorros'} /> AHORROS</div>
                    </div>
                </div>
                <Field label="Entidad Bancaria" value={proveedor.entidad_bancaria} className="col-span-4 border-t-0" />
                <Field label="Número de Cuenta" value={proveedor.numero_cuenta} className="col-span-4 border-r-0 border-t-0" />
            </div>

            {/* (1.7) Declaración Origen de Fondos */}
            <SectionHeader title="Declaración de Origen de Fondos y Bienes" number="1.7" />
            <div className="border border-black p-2 text-[7px] leading-tight text-justify bg-white">
                <p className="mb-2">
                    Declaro expresamente que: El contenido de esta información es veraz y verificable, realizo la siguiente declaración 
                    de fuente de bienes y fondos a <strong>FIRPLAK SA</strong>, con el propósito de dar cumplimiento a las normas legales vigentes.
                </p>
                <div className="pl-2 space-y-1">
                    <p><strong>1).</strong> Los bienes que poseo provienen de: <span className="bg-gray-100 px-2 min-w-[200px] inline-block font-bold">{proveedor.detalle_origen_fondos}</span></p>
                    <p><strong>2).</strong> Mi actividad, profesión u oficio es lícita y la ejerzo dentro del marco legal. Los recursos que poseo no provienen de actividades ilícitas.</p>
                    <p><strong>3).</strong> La información suministrada es veraz y me obligo a actualizarla anualmente o cuando ocurra un cambio relevante.</p>
                    <p><strong>4).</strong> Autorizo a <strong>FIRPLAK SA</strong> para consultar y reportar mis datos conforme a la Ley 1581 de 2012 y Ley 1266 de 2008.</p>
                </div>
            </div>

            {/* (1.8) Firma y Huella */}
            <div className="grid grid-cols-12 mt-2 gap-4">
                <div className="col-span-8">
                    <div className="border border-black flex flex-col items-center justify-end h-32 relative bg-white">
                        <div className="absolute top-2 left-2 text-[6px] font-bold uppercase text-gray-400">Espacio para firma electrónica / manuscrita</div>
                        
                        {/* Aquí se cargaría la imagen de la firma si existiera el publicURL */}
                        {proveedor.firma_url ? (
                            <img src={proveedor.firma_url} alt="Firma" className="max-h-24 max-w-full object-contain mb-2" />
                        ) : (
                            <div className="h-24 w-full flex items-center justify-center border-b border-gray-100 italic text-gray-300 text-[10px]">
                                [ IMAGEN DE FIRMA ]
                            </div>
                        )}
                        
                        <div className="w-4/5 border-t border-black mb-2"></div>
                        <span className="text-[8px] font-bold uppercase mb-2">Firma del Proveedor / Representante Legal</span>
                        <div className="text-[7px] absolute bottom-1 right-2 font-mono text-gray-400">ID: {proveedor.id.substring(0,8)}...</div>
                    </div>
                </div>
                <div className="col-span-4">
                    <div className="border border-black h-32 flex flex-col items-center justify-center bg-white relative">
                        <div className="w-16 h-20 border border-black border-dashed flex items-end justify-center pb-2">
                            <span className="text-[7px] uppercase font-bold text-gray-300">Huella</span>
                        </div>
                        <span className="text-[6px] absolute bottom-1 font-bold uppercase text-gray-400 italic">Índice Derecho</span>
                    </div>
                </div>
            </div>

            {/* Print Logic */}
            <PrintButton />

            {/* Disclaimer Mini */}
            <div className="mt-4 text-[5.5px] text-gray-400 text-center leading-tight">
                FIRPLAK SA - NIT 800.123.456-7 | Formulario Generado Automáticamente por el Sistema de Vinculación de Proveedores | {new Date().toLocaleString()}
            </div>
        </div>
    )
}
