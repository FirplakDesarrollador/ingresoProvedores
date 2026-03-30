'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fetchUsuarios() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('id', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

/**
 * Actualiza los datos de un usuario en la tabla pública.
 * Incluye el cambio de contraseña en texto plano según lo solicitado.
 */
export async function updateUsuario(id: number, updates: { 
  nombre?: string; 
  rol?: string; 
  contraseña?: string;
}) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error al actualizar usuario:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/administracion/usuarios')
    return { success: true }
}
