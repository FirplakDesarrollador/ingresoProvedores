const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Ciudad/Departamento inputs in both places
const replacementStr = `<MunicipioSelect 
                                    label="Ciudad *"
                                    value={formData.ciudad} 
                                    onChange={(val) => {
                                        const parts = val.split(' - ');
                                        const city = parts.length > 1 ? parts[1].trim() : val;
                                        const dept = parts.length > 2 ? parts[2].trim() : '';
                                        // Update form state directly (simulating multiple updateField calls)
                                        updateField('ciudad', city);
                                        updateField('departamento', dept);
                                    }} 
                                />
                                <Input label="Departamento" name="departamento" value={formData.departamento} onChange={updateField} disabled={true} />`;

content = content.replace(
    /<Input label="Ciudad" name="ciudad" value=\{formData\.ciudad\} onChange=\{updateField\} list="ciudades-list" \/>\s*<Input label="Departamento" name="departamento" value=\{formData\.departamento\} onChange=\{updateField\} list="departamentos-list" \/>/g,
    replacementStr
);

// Fix the validation condition
const validationRegex = /disabled=\{\s*(?:tipoContraparte === 'persona_juridica' \|\| \(tipoContraparte === 'contado' && formData\.subtipo_contado === 'Persona Jurídica'\))[\s\S]*?className="flex-1 py-3 bg/g;

content = content.replace(
    /disabled=\{[\s\S]*?\}\s*className="flex-1 py-3 bg/g,
    `disabled={
                                    (tipoContraparte === 'persona_juridica' || (tipoContraparte === 'contado' && formData.subtipo_contado === 'Persona Jurídica')) 
                                    ? (!formData.razon_social || !formData.numero_identificacion || (tipoContraparte !== 'contado' && !formData.codigo_ciiu) || (tipoContraparte !== 'contado' && !formData.tipo_sociedad) || (tipoContraparte !== 'contado' && !formData.origen_capital) || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || (tipoContraparte !== 'contado' && (!formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)))
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)
                                }
                                className="flex-1 py-3 bg`
);


fs.writeFileSync(file, content);
console.log('Done');
