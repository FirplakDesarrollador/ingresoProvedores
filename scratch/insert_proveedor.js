const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from('proveedores')
        .insert([
            {
                tipo_contraparte: 'persona_juridica',
                tipo_documento: 'NIT',
                numero_identificacion: '900123456-7',
                razon_social: 'PROVEEDOR DE PRUEBA S.A.S',
                correo_facturacion: 'prueba@proveedor.com',
                estado: 'pendiente',
                fecha_diligenciamiento: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('Error insertando proveedor:', error);
    } else {
        console.log('Proveedor insertado exitosamente:', data);
    }
}

main();
