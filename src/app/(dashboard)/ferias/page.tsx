'use client'

import React, { useState } from 'react';
import { registrarFeria } from './actions';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function FeriasPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const result = await registrarFeria(formData);

        setIsLoading(false);
        if (result.success) {
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } else {
            setError(result.error || 'Error al guardar el registro.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#254153]">Registro de Ferias</h1>
                <p className="text-gray-500 font-medium mt-1">Crea una nueva oportunidad o contacto de feria.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                {success && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                        <div>
                            <h3 className="font-bold">¡Registro guardado exitosamente!</h3>
                            <p className="text-sm font-medium mt-1 opacity-90">El registro de la feria ha sido almacenado correctamente.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 shrink-0 text-rose-500" />
                        <div>
                            <h3 className="font-bold">Error al guardar</h3>
                            <p className="text-sm font-medium mt-1 opacity-90">{error}</p>
                            {error.includes("registros_ferias") && (
                                <p className="text-xs mt-2 text-rose-600 bg-rose-100/50 p-2 rounded-lg font-mono">
                                    Nota: Asegúrate de que la tabla 'registros_ferias' exista en Supabase con las columnas correctas.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna 1 */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nombre de Cliente / Contacto *</label>
                                <input
                                    required
                                    name="nombre_contacto"
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Teléfono *</label>
                                <input
                                    required
                                    name="telefono"
                                    type="tel"
                                    placeholder="Ej: +57 300 000 0000"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Zona / Ciudad / Departamento *</label>
                                <input
                                    required
                                    name="zona"
                                    type="text"
                                    placeholder="Ej: Medellín, Antioquia"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Canal de Venta *</label>
                                <select
                                    required
                                    name="canal_venta"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium text-gray-700"
                                >
                                    <option value="">Selecciona un canal</option>
                                    <option value="Distribuidor">Distribuidor</option>
                                    <option value="Constructor">Constructor</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Directo">Directo</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Columna 2 */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nombre de Empresa / Cuenta *</label>
                                <input
                                    required
                                    name="nombre_cuenta"
                                    type="text"
                                    placeholder="Ej: Constructora XYZ"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email *</label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Ej: contacto@empresa.com"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Categoría *</label>
                                <select
                                    required
                                    name="categoria"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium text-gray-700"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    <option value="A">A - Alta Prioridad</option>
                                    <option value="B">B - Media Prioridad</option>
                                    <option value="C">C - Baja Prioridad</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Fecha Estimada de Cierre (Oportunidad)</label>
                                <input
                                    name="fecha_cierre"
                                    type="date"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium text-gray-700"
                                />
                                <p className="text-xs text-gray-400 mt-1">Opcional</p>
                            </div>
                        </div>
                    </div>

                    {/* Comentarios (Ancho completo) */}
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-bold text-gray-700">Comentarios *</label>
                        <textarea
                            required
                            name="comentarios"
                            rows={4}
                            placeholder="Detalles sobre el interés, productos, o acuerdos charlados en la feria..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254153]/20 focus:border-[#254153] transition-all font-medium resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-400 font-medium">
                            * El usuario creador y la fecha de registro se guardarán automáticamente.
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-8 rounded-xl bg-[#254153] hover:bg-[#1a2f3d] text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#254153]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Registro'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
