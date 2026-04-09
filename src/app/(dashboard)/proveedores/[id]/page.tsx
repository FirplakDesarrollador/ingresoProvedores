import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import AccionesProveedor from './AccionesProveedor'
import DocumentosList from './DocumentosList'

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProveedorDetallePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: proveedor } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single()

    if (!proveedor || !['pendiente', 'aprobado', 'rechazado'].includes(proveedor.estado)) {
        notFound()
    }

    const { data: documentos } = await supabase
        .from('proveedor_documentos')
        .select('*')
        .eq('proveedor_id', id)

    const Campo = ({ label, value }: { label: string; value: any }) => (
        <div className="py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">{label}:</span>
            <span className="ml-2 text-[#254153] font-medium">{value || '-'}</span>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-[#254153] text-white py-4">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Detalle del Proveedor</h1>
                    <Link href="/proveedores" className="text-white/70 hover:text-white text-sm">← Volver al listado</Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Status Badge */}
                <div className="flex items-center gap-4 mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${proveedor.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                            proveedor.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {proveedor.estado?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm ${proveedor.tipo_contraparte === 'persona_natural'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                        {proveedor.tipo_contraparte === 'persona_natural' ? '👤 Persona Natural' : '🏢 Persona Jurídica'}
                    </span>
                    {proveedor.area_solicitante && (
                        <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700 font-medium">
                            🏢 Área: {proveedor.area_solicitante}
                        </span>
                    )}
                    {proveedor.tipo_solicitud && (
                        <span className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700">
                            {proveedor.tipo_solicitud}
                        </span>
                    )}
                </div>

                {/* Approval Info */}
                {proveedor.estado === 'aprobado' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                        <p className="text-emerald-700"><strong>Aprobado el:</strong> {new Date(proveedor.fecha_decision).toLocaleDateString('es-ES')}</p>
                        <p className="text-emerald-700"><strong>Vigencia hasta:</strong> {proveedor.fecha_vigencia ? new Date(proveedor.fecha_vigencia).toLocaleDateString('es-ES') : '-'}</p>
                    </div>
                )}
                {proveedor.estado === 'rechazado' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-700"><strong>Rechazado el:</strong> {new Date(proveedor.fecha_decision).toLocaleDateString('es-ES')}</p>
                        <p className="text-red-700"><strong>Motivo:</strong> {proveedor.motivo_rechazo}</p>
                    </div>
                )}

                {/* Info Sections */}
                <div className="space-y-6">
                    {/* General */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Información General</h2>
                        {proveedor.tipo_contraparte === 'persona_natural' ? (
                            <div className="grid grid-cols-2 gap-x-8">
                                <Campo label="Nombre" value={`${proveedor.primer_nombre || ''} ${proveedor.segundo_nombre || ''} ${proveedor.primer_apellido || ''} ${proveedor.segundo_apellido || ''}`.trim()} />
                                <Campo label="Tipo Doc" value={proveedor.tipo_documento} />
                                <Campo label="Identificación" value={proveedor.numero_identificacion} />
                                <Campo label="Email" value={proveedor.email} />
                                <Campo label="Celular" value={proveedor.celular} />
                                <Campo label="Profesión" value={proveedor.profesion} />
                                <Campo label="Dirección" value={proveedor.direccion} />
                                <Campo label="Ciudad / Depto" value={`${proveedor.ciudad || ''} - ${proveedor.departamento || ''}`} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-8">
                                <Campo label="Razón Social" value={proveedor.razon_social} />
                                <Campo label="NIT" value={proveedor.numero_identificacion} />
                                <Campo label="Tipo Sociedad" value={proveedor.tipo_sociedad} />
                                <Campo label="Origen Capital" value={proveedor.origen_capital} />
                                <Campo label="CIIU" value={proveedor.codigo_ciiu} />
                                <Campo label="Email Facturación" value={proveedor.correo_facturacion} />
                                <Campo label="Ciudad / Depto" value={`${proveedor.ciudad || ''} - ${proveedor.departamento || ''}`} />
                                <div className="col-span-2 mt-4 pt-4 border-t border-gray-50">
                                    <h3 className="text-sm font-bold text-[#254153] mb-2 uppercase tracking-wider">Representante Legal</h3>
                                    <div className="grid grid-cols-2 gap-x-8">
                                        <Campo label="Nombre" value={proveedor.rep_legal_nombre_completo} />
                                        <Campo label="Identificación" value={proveedor.rep_legal_numero_identificacion} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
5. 
                    {/* PEP y Cumplimiento */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Cumplimiento y PEP</h2>
                        <div className="grid grid-cols-2 gap-x-8">
                            <Campo label="¿Es PEP?" value={proveedor.es_pep ? 'Sí' : 'No'} />
                            <Campo label="¿Vínculo con PEP?" value={proveedor.tiene_vinculo_pep ? 'Sí' : 'No'} />
                            <Campo label="¿Administra recursos públicos?" value={proveedor.administra_recursos_publicos ? 'Sí' : 'No'} />
                            <Campo label="¿Tiene reconocimiento público?" value={proveedor.tiene_reconocimiento_publico ? 'Sí' : 'No'} />
                            <Campo label="¿Tiene grado de poder público?" value={proveedor.tiene_grado_poder_publico ? 'Sí' : 'No'} />
                            <Campo label="¿Rep. Legal es PEP?" value={proveedor.rep_legal_es_pep ? 'Sí' : 'No'} />
                            <div className="col-span-2">
                                <Campo label="¿Sanciones o investigaciones (Lavado/Corrupción)?" value={proveedor.tiene_sanciones_lavado ? 'Sí' : 'No'} />
                            </div>
                        </div>
                    </section>
 
                    {/* Financiera */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Información Financiera</h2>
                        <div className="grid grid-cols-2 gap-x-8">
                            <Campo label="Total Activos" value={proveedor.total_activos ? `$${Number(proveedor.total_activos).toLocaleString()}` : null} />
                            <Campo label="Total Pasivos" value={proveedor.total_pasivos ? `$${Number(proveedor.total_pasivos).toLocaleString()}` : null} />
                            <Campo label="Total Patrimonio" value={proveedor.total_patrimonio ? `$${Number(proveedor.total_patrimonio).toLocaleString()}` : null} />
                            <Campo label="Ingresos Mensuales" value={proveedor.ingresos_mensuales ? `$${Number(proveedor.ingresos_mensuales).toLocaleString()}` : null} />
                            <Campo label="Egresos Mensuales" value={proveedor.egresos_mensuales ? `$${Number(proveedor.egresos_mensuales).toLocaleString()}` : null} />
                            <Campo label="Otros Ingresos" value={proveedor.otros_ingresos_mensuales ? `$${Number(proveedor.otros_ingresos_mensuales).toLocaleString()}` : null} />
                            <Campo label="Concepto Otros Ingresos" value={proveedor.concepto_otros_ingresos} />
                            <Campo label="Fecha Corte Info" value={proveedor.fecha_corte_info_financiera ? new Date(proveedor.fecha_corte_info_financiera).toLocaleDateString('es-ES') : null} />
                            <Campo label="¿Posee Activos Virtuales?" value={proveedor.posee_activos_virtuales ? 'Sí' : 'No'} />
                            <Campo label="¿Op. Internacionales?" value={proveedor.realiza_operaciones_internacionales ? 'Sí' : 'No'} />
                        </div>
                    </section>
 
                    {/* SST */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Seguridad y Salud en el Trabajo</h2>
                        <Campo label="¿Cuenta con evaluación de autodiagnóstico SST?" value={proveedor.tiene_evaluacion_sst ? 'Sí' : 'No'} />
                    </section>
 
                    {/* Bancaria */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Información Bancaria</h2>
                        <div className="grid grid-cols-2 gap-x-8">
                            <Campo label="Tipo Cuenta" value={proveedor.tipo_cuenta} />
                            <Campo label="Entidad" value={proveedor.entidad_bancaria} />
                            <Campo label="Número Cuenta" value={proveedor.numero_cuenta} />
                        </div>
                    </section>

                    {/* Previsualización PDF Oficial */}
                    <section className="bg-white rounded-xl border overflow-hidden">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-[#254153]">Formulario Oficial Generado (PDF)</h2>
                                <p className="text-sm text-gray-500">Documento de conocimiento de contraparte.</p>
                            </div>
                        </div>
                        <div className="bg-gray-200 p-4 flex justify-center">
                            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden border">
                                <iframe 
                                    src={`/visor-pdf/${id}`} 
                                    className="w-full h-[800px] border-none"
                                    title="Previsualización PDF"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Documentos de Soporte del Bucket */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Documentos de Soporte Adjuntos (Bucket)</h2>
                        {documentos && documentos.length > 0 ? (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-500 mb-4">Estos son los archivos originales cargados por el proveedor durante su registro:</p>
                                <DocumentosList 
                                    documentos={documentos as any} 
                                    supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} 
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500">No hay documentos cargados en el bucket para este proveedor.</p>
                            </div>
                        )}
                    </section>

                    {/* Acciones */}
                    <section className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold text-[#254153] mb-4">Acciones de Aprobación</h2>
                        <AccionesProveedor proveedorId={id} estadoActual={proveedor.estado} />
                    </section>
                </div>
            </main>
        </div>
    )
}
