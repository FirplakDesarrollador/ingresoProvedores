import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const supabase = await createClient()

        const { data: proveedor, error } = await supabase
            .from('proveedores')
            .insert({
                ...data,
                estado: 'pendiente'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, id: proveedor.id })
    } catch (e) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
