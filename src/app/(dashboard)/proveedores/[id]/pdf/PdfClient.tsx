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
        <div className="w-4 h-4 border border-black flex items-center justify-center text-[10px] font-bold">
            {checked ? 'X' : ''}
        </div>
    )

    const Field = ({ label, value, className = "" }: { label: string, value?: any, className?: string }) => (
        <div className={`border border-black p-1 flex flex-col min-h-[40px] ${className}`}>
            <span className="text-[7px] uppercase font-bold leading-tight">{label}</span>
            <span className="text-[10px] uppercase font-medium truncate">{value || ''}</span>
        </div>
    )

    return (
        <div className="bg-white p-8 max-w-[21cm] mx-auto text-black font-sans leading-tight print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="w-1/4">
                    <div className="font-bold text-xl text-[#254153]">FIRPLAK</div>
                </div>
                <div className="w-1/2 text-center">
                    <h1 className="font-bold text-sm uppercase">FORMULARIO DE CONOCIMIENTO DE CONTRAPARTES</h1>
                </div>
                <div className="w-1/4 text-[8px] text-right italic">
                    Versión 1.0
                </div>
            </div>

            <p className="text-[8px] mb-2 leading-tight">
                Esta información es estrictamente confidencial y será utilizada únicamente para cumplir con las disposiciones establecidas en 
                la Circular Externa No. 100-000016 del 24 de diciembre de 2020, relacionada con el "Autocontrol y Gestión del Riesgo Integral 
                LA/FT/FPADM" según lo ordenado por la Superintendencia de Sociedades. Adicionalmente, el formato de recolección y tratamiento de estos datos cumple plenamente con los lineamientos establecidos en la Ley 1581 de 2012 y sus decretos reglamentarios.
            </p>

            {/* Fecha Diligenciamiento */}
            <div className="flex justify-end items-center gap-2 mb-2">
                <span className="text-[8px] font-bold">FECHA DE DILIGENCIAMIENTO:</span>
                <div className="flex border border-black text-center text-[9px]">
                    <div className="w-8 border-r border-black"><div className="border-b border-black bg-gray-100 uppercase text-[6px]">Día</div>{dD}</div>
                    <div className="w-8 border-r border-black"><div className="border-b border-black bg-gray-100 uppercase text-[6px]">Mes</div>{dM}</div>
                    <div className="w-12"><div className="border-b border-black bg-gray-100 uppercase text-[6px]">Año</div>{dY}</div>
                </div>
            </div>

            {/* (1) Información General */}
            <div className="bg-gray-200 text-[9px] font-bold p-1 border border-black mb-1 uppercase">
                (1) Información General
            </div>

            <div className="grid grid-cols-12 gap-0 border border-black">
                <div className="col-span-4 border-r border-black p-1">
                    <span className="text-[7px] font-bold block uppercase">Tipo de Solicitud</span>
                    <div className="flex gap-4 text-[9px] mt-1">
                        <div className="flex items-center gap-1"><Box checked={true} /> Nuevo</div>
                        <div className="flex items-center gap-1"><Box /> Actualización</div>
                    </div>
                </div>
                <div className="col-span-8 p-1">
                    <span className="text-[7px] font-bold block uppercase">Tipo de Contraparte (Marque con una X)</span>
                    <div className="flex gap-4 text-[9px] mt-1">
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'persona_natural'} /> P. Natural</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'persona_juridica'} /> P. Jurídica</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_contraparte === 'empleado'} /> Empleado</div>
                    </div>
                </div>

                {proveedor.tipo_contraparte !== 'persona_juridica' ? (
                    <>
                        <Field label="Primer Apellido" value={proveedor.primer_apellido} className="col-span-3 border-t-0" />
                        <Field label="Segundo Apellido" value={proveedor.segundo_apellido} className="col-span-3 border-t-0" />
                        <Field label="Primer Nombre" value={proveedor.primer_nombre} className="col-span-3 border-t-0" />
                        <Field label="Segundo Nombre" value={proveedor.segundo_nombre} className="col-span-3 border-t-0" />
                        
                        <div className="col-span-3 border border-black border-l-0 p-1">
                            <span className="text-[7px] font-bold block uppercase">Tipo Documento</span>
                            <div className="flex flex-wrap gap-1 text-[8px] mt-1">
                                <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('CC')} /> CC</div>
                                <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('CE')} /> CE</div>
                                <div className="flex items-center gap-0.5"><Box checked={proveedor.tipo_documento?.includes('PAS')} /> PAS</div>
                            </div>
                        </div>
                        <Field label="Número Identificación" value={proveedor.numero_identificacion} className="col-span-3" />
                        <div className="col-span-3 border border-black p-1">
                            <span className="text-[7px] font-bold block uppercase">Fecha Expedición</span>
                            <div className="flex text-center text-[9px]">
                                <div className="flex-1 border-r border-black">{eD}</div>
                                <div className="flex-1 border-r border-black">{eM}</div>
                                <div className="flex-1">{eY}</div>
                            </div>
                        </div>
                        <Field label="Lugar Expedición" value={proveedor.lugar_expedicion} className="col-span-3 border-r-0" />
                        
                        <div className="col-span-3 border border-black border-l-0 p-1">
                            <span className="text-[7px] font-bold block uppercase">Fecha Nacimiento</span>
                            <div className="flex text-center text-[9px]">
                                <div className="flex-1 border-r border-black">{nD}</div>
                                <div className="flex-1 border-r border-black">{nM}</div>
                                <div className="flex-1">{nY}</div>
                            </div>
                        </div>
                        <Field label="Lugar Nacimiento" value={proveedor.lugar_nacimiento} className="col-span-3" />
                        <Field label="País" value={proveedor.pais || 'Colombia'} className="col-span-3" />
                        <Field label="Departamento" value={proveedor.departamento} className="col-span-3 border-r-0" />
                        
                        <Field label="Ciudad" value={proveedor.ciudad} className="col-span-3 border-l-0" />
                        <Field label="Dirección" value={proveedor.direccion} className="col-span-6" />
                        <Field label="E-mail" value={proveedor.email} className="col-span-3 border-r-0" />
                        
                        <Field label="Teléfono 1" value={proveedor.telefono1_numero} className="col-span-3 border-l-0 border-b-0" />
                        <Field label="Celular" value={proveedor.celular} className="col-span-3 border-b-0" />
                        <Field label="Profesión" value={proveedor.profesion} className="col-span-6 border-b-0 border-r-0" />
                    </>
                ) : (
                    <>
                        <Field label="Nombre o Razón Social" value={proveedor.razon_social} className="col-span-8 border-t-0" />
                        <Field label="NIT" value={proveedor.numero_identificacion} className="col-span-4 border-t-0 border-r-0" />
                        
                        <div className="col-span-6 border border-black border-l-0 border-b-0 p-1">
                            <span className="text-[7px] font-bold block uppercase">Tipo de Sociedad</span>
                            <div className="flex gap-2 text-[8px] mt-1">
                                <div className="flex items-center gap-1"><Box checked={proveedor.tipo_sociedad === 'Anónima'} /> Anónima</div>
                                <div className="flex items-center gap-1"><Box checked={proveedor.tipo_sociedad === 'Limitada'} /> Limitada</div>
                                <div className="flex items-center gap-1"><Box checked={proveedor.tipo_sociedad === 'S.A.S.'} /> S.A.S.</div>
                                <div className="flex items-center gap-1"><Box checked={!['Anónima','Limitada','S.A.S.'].includes(proveedor.tipo_sociedad || '')} /> Otra</div>
                            </div>
                        </div>
                        <div className="col-span-3 border border-black border-b-0 p-1">
                            <span className="text-[7px] font-bold block uppercase">Origen de Capital</span>
                            <div className="flex gap-2 text-[8px] mt-1">
                                <div className="flex items-center gap-1"><Box checked={proveedor.origen_capital === 'Privada'} /> Privada</div>
                                <div className="flex items-center gap-1"><Box checked={proveedor.origen_capital === 'Pública'} /> Pública</div>
                                <div className="flex items-center gap-1"><Box checked={proveedor.origen_capital === 'Mixta'} /> Mixta</div>
                            </div>
                        </div>
                        <Field label="Código CIIU" value={proveedor.codigo_ciiu} className="col-span-3 border-b-0 border-r-0" />
                    </>
                )}
            </div>

            {/* Accionistas */}
            <div className="bg-gray-100 text-[8px] font-bold p-0.5 border border-black mt-2 uppercase">
                (1.2.4) Relación de accionistas ({'>'} 5% participación)
            </div>
            <table className="w-full border-collapse border border-black text-[8px]">
                <thead className="bg-gray-50 uppercase">
                    <tr>
                        <th className="border border-black p-0.5">Nombre o Razón Social</th>
                        <th className="border border-black p-0.5">T. Doc</th>
                        <th className="border border-black p-0.5">N. Documento</th>
                        <th className="border border-black p-0.5">% Part.</th>
                        <th className="border border-black p-0.5">Adm. Rec. Públicos?</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3].map(i => (
                        <tr key={i} className="h-4">
                            <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PEP Questions */}
            <div className="bg-gray-100 text-[8px] font-bold p-0.5 border border-black mt-2 uppercase">
                (1.1.2) Preguntas de Control
            </div>
            <div className="grid grid-cols-12 border border-black text-[8px]">
                {[
                    { label: "¿Es PEP?", value: proveedor.es_pep },
                    { label: "¿Vínculo con PEP?", value: proveedor.tiene_vinculo_pep },
                    { label: "¿Adm. Recursos Públicos?", value: proveedor.administra_recursos_publicos },
                    { label: "¿Grado Poder Público?", value: proveedor.tiene_grado_poder_publico },
                    { label: "¿Reconocimiento Público?", value: proveedor.tiene_reconocimiento_publico }
                ].map((q, i) => (
                    <div key={i} className="col-span-4 border-r border-b border-black last:border-r-0 p-1 flex justify-between items-center h-8">
                        <span className="uppercase">{q.label}</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1">SI <Box checked={q.value === true} /></span>
                            <span className="flex items-center gap-1">NO <Box checked={q.value === false} /></span>
                        </div>
                    </div>
                ))}
            </div>

            {/* (1.3) Información Financiera */}
            <div className="bg-gray-200 text-[9px] font-bold p-1 border border-black mt-2 uppercase">
                (1.3) Información Financiera
            </div>
            <div className="grid grid-cols-12 border border-black">
                <Field label="Total Activos" value={proveedor.total_activos ? `$ ${Number(proveedor.total_activos).toLocaleString()}` : ''} className="col-span-4 border-l-0 border-t-0" />
                <Field label="Total Pasivos" value={proveedor.total_pasivos ? `$ ${Number(proveedor.total_pasivos).toLocaleString()}` : ''} className="col-span-4 border-t-0" />
                <Field label="Total Patrimonio" value="" className="col-span-4 border-t-0 border-r-0" />
                <Field label="Ingresos Mensuales" value={proveedor.ingresos_mensuales ? `$ ${Number(proveedor.ingresos_mensuales).toLocaleString()}` : ''} className="col-span-4 border-l-0" />
                <Field label="Egresos Mensuales" value={proveedor.egresos_mensuales ? `$ ${Number(proveedor.egresos_mensuales).toLocaleString()}` : ''} className="col-span-4" />
                <Field label="Otros Ingresos" value="" className="col-span-4 border-r-0" />
                <Field label="Concepto Otros Ingresos" value="" className="col-span-8 border-l-0 border-b-0" />
                <div className="col-span-4 border border-black border-t-0 border-r-0 border-b-0 p-1 flex items-center justify-between">
                    <span className="text-[7px] font-bold uppercase">Activos Virtuales</span>
                    <div className="flex gap-2 text-[8px]">
                        <span className="flex items-center gap-1">SI <Box /></span>
                        <span className="flex items-center gap-1">NO <Box /></span>
                    </div>
                </div>
            </div>

            {/* (1.4) Información Bancaria */}
            <div className="bg-gray-200 text-[9px] font-bold p-1 border border-black mt-2 uppercase">
                (1.4) Información Bancaria
            </div>
            <div className="grid grid-cols-12 border border-black border-b-0">
                <div className="col-span-3 border-r border-black p-1">
                    <span className="text-[7px] font-bold block uppercase">Tipo de cuenta</span>
                    <div className="flex gap-2 text-[8px] mt-1">
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_cuenta === 'Corriente'} /> Corriente</div>
                        <div className="flex items-center gap-1"><Box checked={proveedor.tipo_cuenta === 'Ahorros'} /> Ahorros</div>
                    </div>
                </div>
                <Field label="Entidad Bancaria" value={proveedor.entidad_bancaria} className="col-span-3 border-t-0 border-l-0" />
                <Field label="Sucursal" value="" className="col-span-3 border-t-0" />
                <Field label="Número de cuenta" value={proveedor.numero_cuenta} className="col-span-3 border-t-0 border-r-0" />
            </div>

            {/* (1.7) Declaración de origen de fondos */}
            <div className="bg-gray-200 text-[9px] font-bold p-1 border border-black mt-0 uppercase">
                (1.7) Declaración de origen de fondos
            </div>
            <div className="border border-black p-2 text-[7px] leading-tight">
                <p className="mb-1">Declaro expresamente que: El contenido de esta información es veraz y verificable, realizo la siguiente declaración de fuente de bienes y fondos a Firplak SA, con el propósito de dar cumplimiento a las normas legales vigentes.</p>
                <p className="mb-1">1). Los bienes que poseo provienen de: (Detalle de ocupación, oficio, actividad, negocio): _______________________________________________________________________.</p>
                <p>2). Tanto mi actividad, profesión u oficio es lícita y la ejerzo dentro del marco legal. Los recursos que poseo no proviene de actividades ilícitas contempladas en el Código Penal de Colombia o cualquier norma que le modifique o adicione. 3). La información que he suministrado en este documento es veraz y verificable y me obligo a actualizarla anualmente. 4). De manera irrevocable, autorizo a Firplak SA para solicitar, consultar, procesar, suministrar, reportar o divulgar, conforme a lo establecido en la Ley 1581 de 2012, sobre protección de datos personales, y la Ley 1266de 2008,sobre el manejo de información financiera, crediticia, comercial y de servicios, la información contenida en este formulario.</p>
            </div>

            {/* Firma y Huella */}
            <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-8 border-t border-black mt-8 text-center pt-1">
                    <span className="text-[9px] font-bold uppercase">FIRMA REPRESENTANTE LEGAL / PERSONA NATURAL</span>
                    <div className="text-[8px] mt-1 italic">N. Identificación: {proveedor.numero_identificacion}</div>
                </div>
                <div className="col-span-4 flex flex-col items-center">
                    <div className="w-20 h-24 border border-black border-dashed flex items-end justify-center pb-2">
                        <span className="text-[7px] uppercase text-gray-400 font-bold">Huella</span>
                    </div>
                </div>
            </div>

            <PrintButton />

            {/* Final Legal Note */}
            <div className="mt-4 text-[6px] text-gray-500 leading-tight">
                En cumplimiento de la Ley 1581 de 2012, Firplak SA informa que el tratamiento de datos personales se rige por principios legales y éticos que garantizan seguridad y confidencialidad. 
                Usted puede conocer, actualizar y rectificar su información a través de los canales habilitados. Correo: protecciondatos@firplak.com.
            </div>
        </div>
    )
}
