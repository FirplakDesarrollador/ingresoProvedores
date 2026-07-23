import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    
    // Nits de prueba a borrar
    const nits = ['12312', '2341234']

    const { data, error } = await supabase.from('proveedores').delete().in('numero_identificacion', nits)
    
    if (error) {
        return NextResponse.json({ error: error.message })
    }
    return NextResponse.json({ success: true, message: `Proveedores de prueba (NITs ${nits.join(', ')}) borrados exitosamente. Ya puedes cerrar esta pestaña e intentar registrar de nuevo.` })
}
