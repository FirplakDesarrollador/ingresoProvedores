const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
    const flowUrl = 'https://8c18912a4169ec67aa9b39bdfb7cc3.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f42c4abbfb1348638e6979ae06ce6d46/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=EGOpkgsZvV6besSuWZTt6MicxenHwdeu2cGc1YTqQFU';
    
    console.log('Descargando PDF de Supabase...');
    const { data: fileData, error: fileError } = await supabase
        .storage
        .from('proveedores')
        .download('fd60361a-9e81-4d4c-92f9-3f0a703cccfd/CERT_BANCARIA_1778252351627.pdf');

    if (fileError) {
        console.error('Error descargando el archivo:', fileError);
        return;
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log(`PDF descargado exitosamente. Tamaño base64: ${base64.length} caracteres.`);

    const payload = {
        titulo: "MULTI TRANSPORT INTERNATIONAL SAS",
        pdf: {
            nombre: "CERTIFICACION BANCARIA IRIS MULTI TRANSPORT.pdf",
            contenido: base64
        }
    };

    console.log('Enviando payload a Power Automate...');

    try {
        const response = await fetch(flowUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en el flow (${response.status}): ${errorText}`);
        }

        console.log('¡Flujo ejecutado con éxito!');
    } catch (e) {
        console.error('Excepción ejecutando flujo:', e);
    }
}

testFlow();
