import { createBusinessPartner } from '../src/lib/sap.ts';
import { createClient } from '@supabase/supabase-js';




const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const id = 'd8c7c91a-f4b2-4d51-89ab-a02e6b9c9342';
    console.log('Obteniendo datos de Supabase para:', id);
    const { data, error } = await supabase.from('proveedores').select('*').eq('id', id).single();
    
    if (error || !data) {
        console.error('Error fetching:', error);
        return;
    }

    console.log('Datos obtenidos, enviando a SAP...');
    const result = await createBusinessPartner(data);
    console.log('Resultado SAP:', result);
    
    if (result.success) {
        await supabase.from('proveedores').update({ estado: 'aprobado', sap_card_code: result.cardCode }).eq('id', id);
        console.log('Proveedor actualizado a aprobado en Supabase con CardCode', result.cardCode);
    }
}

run();
