'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function aprobarProveedor(id: string, fechaVigencia: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('proveedores')
        .update({
            estado: 'aprobado',
            fecha_aprobacion: new Date().toISOString(),
            fecha_vigencia: fechaVigencia,
            aprobado_por: user?.id,
            fecha_decision: new Date().toISOString(),
            motivo_rechazo: null
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/proveedores')
    revalidatePath(`/proveedores/${id}`)
    return { success: true }
}

export async function rechazarProveedor(id: string, motivo: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('proveedores')
        .update({
            estado: 'rechazado',
            motivo_rechazo: motivo,
            aprobado_por: user?.id,
            fecha_decision: new Date().toISOString(),
            fecha_aprobacion: null,
            fecha_vigencia: null
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/proveedores')
    revalidatePath(`/proveedores/${id}`)
    return { success: true }
}
