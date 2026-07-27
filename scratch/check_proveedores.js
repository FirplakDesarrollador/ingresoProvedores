const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: cols, error } = await supabase.rpc('get_proveedores_columns');
    if (error) console.log('RPC error:', error);

    const { data, error: e2 } = await supabase.from('proveedores').select('*').order('created_at', { ascending: false }).limit(2);
    console.log('Ultimos proveedores:');
    if (data) {
        data.forEach(p => console.log('Ciudad:', p.ciudad, '| Departamento:', p.departamento, '| Municipio med mag:', p.municipio_med_mag, '| CIIU:', p.codigo_ciiu, '| Actividad:', p.actividad_economica));
    }
}
check();
