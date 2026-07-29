import { createBusinessPartner } from '../src/lib/sap';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
    const { data } = await supabase.from('proveedores').select('*').eq('numero_identificacion', '123123123231231312').single();
    console.log("Testing BP creation for", data.id);
    const res = await createBusinessPartner(data);
    console.log("Result:", res);
}
test();
