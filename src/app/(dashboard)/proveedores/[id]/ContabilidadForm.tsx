'use client'

import { useState } from 'react'
import { aprobarContabilidad } from '../actions'
import retencionesSap from '@/lib/retenciones_sap.json'

interface ContabilidadFormProps {
    proveedor: any
}

export default function ContabilidadForm({ proveedor }: ContabilidadFormProps) {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        grupo_bp: proveedor.grupo_bp || '',
        cuenta_asociada: proveedor.cuenta_asociada || '',
        aplica_retenciones: proveedor.aplica_retenciones || false,
        sujeto_a_retencion: proveedor.sujeto_a_retencion || false,
        codigos_retencion: proveedor.codigos_retencion || []
    })

    const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? isChecked : value
        }))
    }

    const toggleRetencion = (wtCode: string) => {
        setFormData(prev => {
            const list = [...prev.codigos_retencion]
            if (list.includes(wtCode)) {
                return { ...prev, codigos_retencion: list.filter(c => c !== wtCode) }
            } else {
                return { ...prev, codigos_retencion: [...list, wtCode] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSaved(false)
        setError(null)
        
        try {
            const result = await aprobarContabilidad(proveedor.id, formData)

            if (!result.success) throw new Error(result.error)
            
            setSaved(true)
            alert('✅ Contabilidad aprobada y Proveedor enviado a SAP con éxito.')
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-left">
            <h2 className="text-xl font-medium text-gray-600 mb-6">Módulo de Contabilidad</h2>
            
            <div className="space-y-6">
                {proveedor.tipo_contraparte !== 'empleado' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-[#254153] mb-1">Grupo SAP <span className="text-red-500">*</span></label>
                            <select 
                                name="grupo_bp" 
                                value={formData.grupo_bp} 
                                onChange={updateField} 
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153]"
                            >
                                <option value="">Seleccione un grupo...</option>
                                <option value="Proveedor Nacional">Proveedor Nacional</option>
                                <option value="Proveedor de Servicios">Proveedor de Servicios</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Este grupo determinará el prefijo del código en SAP (PN o AC).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#254153] mb-1">Cuenta asociada a proveedores <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="cuenta_asociada" 
                                value={formData.cuenta_asociada} 
                                onChange={updateField} 
                                required
                                placeholder="Ej: 23359505"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#254153]"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                                <input 
                                    type="checkbox" 
                                    name="sujeto_a_retencion" 
                                    checked={formData.sujeto_a_retencion} 
                                    onChange={(e) => {
                                        updateField(e)
                                        setFormData(p => ({ ...p, aplica_retenciones: e.target.checked }))
                                    }}
                                    className="w-4 h-4 text-[#254153] rounded" 
                                />
                                <span className="text-sm text-[#254153] font-medium">Sujeto a retención (SAP)</span>
                            </label>

                        {formData.sujeto_a_retencion && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#254153] mb-2">Código(s) Permitido(s)</label>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2 space-y-1">
                                        {retencionesSap.map((wt) => (
                                            <label key={wt.WTCode} className="flex items-start gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.codigos_retencion.includes(wt.WTCode)}
                                                    onChange={() => toggleRetencion(wt.WTCode)}
                                                    className="w-4 h-4 mt-0.5 text-[#254153] rounded"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">{wt.WTCode} - {wt.WTName}</div>
                                                    <div className="text-xs text-gray-500">Tasa: {wt.Rate}%</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                )}
            </div>
            
            {error && (
                <div className="mt-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}
            
            {saved && (
                <div className="mt-6 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
                    Datos contables guardados correctamente.
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-2 bg-[#254153] text-white text-sm font-medium rounded-lg hover:bg-[#1a2d3a] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Guardando y Enviando...' : 'Aprobar y Enviar a SAP'}
                </button>
            </div>
        </form>
    )
}
