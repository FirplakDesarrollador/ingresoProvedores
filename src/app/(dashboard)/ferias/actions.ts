'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarFeria(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Usuario no autenticado' }
        }

        const data = {
            nombre_contacto: formData.get('nombre_contacto'),
            nombre_cuenta: formData.get('nombre_cuenta'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            comentarios: formData.get('comentarios'),
            zona: formData.get('zona'),
            categoria: formData.get('categoria'),
            canal_venta: formData.get('canal_venta'),
            fecha_cierre: formData.get('fecha_cierre') || null,
            usuario_creador: user.email,
            fecha_registro: new Date().toISOString()
        }

        // Validate required fields
        const requiredFields = ['nombre_contacto', 'nombre_cuenta', 'telefono', 'email', 'comentarios', 'zona', 'categoria', 'canal_venta'];
        for (const field of requiredFields) {
            if (!data[field as keyof typeof data]) {
                return { success: false, error: `El campo ${field} es obligatorio` }
            }
        }

        const { error } = await supabase
            .from('registros_ferias')
            .insert([data])

        if (error) {
            console.error('Error insertando registro_feria:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/ferias')
        return { success: true }
    } catch (error: any) {
        console.error('Error in registrarFeria action:', error)
        return { success: false, error: error.message || 'Error interno' }
    }
}
