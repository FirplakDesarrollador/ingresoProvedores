import { NextResponse } from 'next/server';
import { createBusinessPartner } from '@/lib/sap';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'No id provided' }, { status: 400 });

    const supabase = await createClient();
    const { data: proveedor, error } = await supabase.from('proveedores').select('*').eq('numero_identificacion', id).single();

    if (error || !proveedor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await createBusinessPartner(proveedor);

    return NextResponse.json({ result, proveedor });
}
