import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    const { data } = await supabase.from('proveedores').select('*').eq('numero_identificacion', '283642634');
    console.log(JSON.stringify(data, null, 2));
}

check();
