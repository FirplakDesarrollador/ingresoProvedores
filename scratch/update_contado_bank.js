const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Prefill data for contado
content = content.replace(
  /if \(tipo === 'empleado' \|\| tipo === 'contado'\) \{([\s\S]*?)setFormData\(prev => \(\{([\s\S]*?)\}\)\)/,
  `if (tipo === 'empleado' || tipo === 'contado') {$1setFormData(prev => ({$2,
                ...(tipo === 'contado' ? {
                    tipo_cuenta: 'Ahorros',
                    entidad_bancaria: 'CITIBANK',
                    numero_cuenta: '1231231212'
                } : {})
            }))`
);

// 2. Hide cert_bancaria for contado
content = content.replace(
  /<FileInput label="Certificación Bancaria" name="cert_bancaria" onChange=\{updateField\} \/>/g,
  `{tipoContraparte !== 'contado' && <FileInput label="Certificación Bancaria" name="cert_bancaria" onChange={updateField} />}`
);

// 3. Make cert_bancaria optional in the submit button disabled condition
content = content.replace(
  /disabled=\{loading \|\| !formData\.tipo_cuenta \|\| !formData\.entidad_bancaria \|\| !formData\.numero_cuenta \|\| !formData\.cert_bancaria\}/g,
  `disabled={loading || !formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta || (tipoContraparte !== 'contado' && !formData.cert_bancaria)}`
);

fs.writeFileSync(file, content);
console.log('Done');
