const { createBusinessPartner } = require('./src/lib/sap');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    const { data } = await supabase.from('proveedores').select('*').eq('numero_identificacion', '283642634').single();
    console.log("Testing BP creation for", data.id);
    const res = await createBusinessPartner(data);
    console.log("Result:", res);
}
test();
