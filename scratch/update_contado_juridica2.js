const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Hide Tipo Sociedad
content = content.replace(
    /<Select label="Tipo Sociedad" name="tipo_sociedad" value=\{formData\.tipo_sociedad\} onChange=\{updateField\}\s+options=\{\['Anónima', 'Limitada', 'S\.A\.S\.', 'Sin Ánimo de Lucro', 'Otra'\]\} \/>/g,
    `{tipoContraparte !== 'contado' && <Select label="Tipo Sociedad" name="tipo_sociedad" value={formData.tipo_sociedad} onChange={updateField}
                                    options={['Anónima', 'Limitada', 'S.A.S.', 'Sin Ánimo de Lucro', 'Otra']} />}`
);

// 2. Hide Origen Capital
content = content.replace(
    /<Select label="Origen Capital" name="origen_capital" value=\{formData\.origen_capital\} onChange=\{updateField\}\s+options=\{\['Privada', 'Pública', 'Mixta'\]\} \/>/g,
    `{tipoContraparte !== 'contado' && <Select label="Origen Capital" name="origen_capital" value={formData.origen_capital} onChange={updateField}
                                    options={['Privada', 'Pública', 'Mixta']} />}`
);

// 3. Update validation logic
const oldValidationStr = `(tipoContraparte === 'persona_juridica' || (tipoContraparte === 'contado' && formData.subtipo_contado === 'Persona Jurídica'))
                                    ? (!formData.razon_social || !formData.numero_identificacion || (tipoContraparte !== 'contado' && !formData.codigo_ciiu) || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || (tipoContraparte !== 'contado' && (!formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)))`;

const newValidationStr = `(tipoContraparte === 'persona_juridica' || (tipoContraparte === 'contado' && formData.subtipo_contado === 'Persona Jurídica'))
                                    ? (!formData.razon_social || !formData.numero_identificacion || (tipoContraparte !== 'contado' && !formData.codigo_ciiu) || (tipoContraparte !== 'contado' && !formData.tipo_sociedad) || (tipoContraparte !== 'contado' && !formData.origen_capital) || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || (tipoContraparte !== 'contado' && (!formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)))`;

content = content.replace(oldValidationStr, newValidationStr);

fs.writeFileSync(file, content);
console.log('Done');
