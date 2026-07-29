const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('tipo_contraparte', 'empleado')
        .order('created_at', { ascending: false })
        .limit(2);
        
    console.log(JSON.stringify(data, null, 2));
}

main();
