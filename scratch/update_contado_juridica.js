const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Hide Código CIIU
content = content.replace(
    /<Input label="Código CIIU" name="codigo_ciiu" value={formData.codigo_ciiu} onChange={updateField} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="Código CIIU" name="codigo_ciiu" value={formData.codigo_ciiu} onChange={updateField} />}`
);

// 2. Hide Nombre Representante Legal
content = content.replace(
    /<Input label="Nombre Representante Legal" name="rep_legal_nombre_completo" value={formData.rep_legal_nombre_completo} className="col-span-2" onChange={updateField} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="Nombre Representante Legal" name="rep_legal_nombre_completo" value={formData.rep_legal_nombre_completo} className="col-span-2" onChange={updateField} />}`
);

// 3. Hide CC Representante Legal
content = content.replace(
    /<Input label="CC Representante Legal" name="rep_legal_numero_identificacion" value={formData.rep_legal_numero_identificacion} onChange={updateField} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="CC Representante Legal" name="rep_legal_numero_identificacion" value={formData.rep_legal_numero_identificacion} onChange={updateField} />}`
);

// 4. Update Validation Logic
const oldValidation = `tipoContraparte === 'persona_juridica' 
                                    ? (!formData.razon_social || !formData.numero_identificacion || !formData.codigo_ciiu || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || !formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)`;

const newValidation = `(tipoContraparte === 'persona_juridica' || (tipoContraparte === 'contado' && formData.subtipo_contado === 'Persona Jurídica'))
                                    ? (!formData.razon_social || !formData.numero_identificacion || (tipoContraparte !== 'contado' && !formData.codigo_ciiu) || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || (tipoContraparte !== 'contado' && (!formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)))
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)`;

content = content.replace(oldValidation, newValidation);

fs.writeFileSync(file, content);
console.log('Done');
