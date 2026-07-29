const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: tables, error } = await supabase.rpc('get_tables');
    // Si falla el rpc, intentemos un select directo pero postgrest no suele exponer pg_tables.
    // Veamos qué podemos hacer. 
    console.log('Tablas (via rpc si existe):', tables, error);
}
check();
