const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createProveedor() {
  const { data, error } = await supabase
    .from('proveedores')
    .insert([
      {
        tipo_solicitud: 'Nuevo Registro',
        tipo_contraparte: 'persona_juridica',
        razon_social: 'PROVEEDOR PRUEBA BANCOLOMBIA S.A.S',
        numero_identificacion: '900888999-1',
        estado: 'pendiente',
        email: 'prueba.banco@test.com',
        correo_facturacion: 'facturacion.banco@test.com',
        celular: '3001112233',
        pais: 'Colombia',
        departamento: 'ANTIOQUIA',
        ciudad: 'MEDELLIN',
        direccion: 'CARRERA 43A # 1-50',
        tipo_sociedad: 'S.A.S.',
        origen_capital: 'Privada',
        tipo_cuenta: 'Ahorros',
        entidad_bancaria: 'Bancolombia',
        numero_cuenta: '98765432100',
        dias_credito: '30',
        rep_legal_nombre_completo: 'Maria Garcia Lopez',
        rep_legal_numero_identificacion: '9876543210',
        regimen_tributario: 'Régimen Común',
        regimen_fiscal: '05 - Régimen Ordinario',
        actividad_economica: 'Comercio al por mayor',
        municipio_med_mag: '05001',
        nacionalidad: 'Nacional',
        tipo_extranjero: 'No aplica',
        medio_de_pago: '47',
        codigo_ciiu: '4690'
      }
    ])
    .select('id, razon_social, dias_credito, entidad_bancaria, numero_cuenta, tipo_cuenta');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Creado:', JSON.stringify(data[0], null, 2));
  }
}

createProveedor();
