const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Initial form data for contado
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

// 2. Hide cert_bancaria file input
content = content.replace(
  /<FileInput label="Certificación Bancaria" name="cert_bancaria" onChange=\{updateField\} \/>/g,
  `{tipoContraparte !== 'contado' && <FileInput label="Certificación Bancaria" name="cert_bancaria" onChange={updateField} />}`
);

// 3. Make cert_bancaria optional in disabled
content = content.replace(
  /disabled=\{loading \|\| !formData\.tipo_cuenta \|\| !formData\.entidad_bancaria \|\| !formData\.numero_cuenta \|\| !formData\.cert_bancaria\}/g,
  `disabled={loading || !formData.tipo_cuenta || !formData.entidad_bancaria || !formData.numero_cuenta || (tipoContraparte !== 'contado' && !formData.cert_bancaria)}`
);

// 4. Hide bank fields
const targetStr = `<div className="col-span-2 pt-4 border-t border-gray-100 mb-2 mt-4">
                                <h3 className="text-sm font-bold text-[#254153] uppercase tracking-wider">Información Bancaria</h3>
                            </div>
                            <Select label="Tipo de Cuenta" name="tipo_cuenta" value={formData.tipo_cuenta} onChange={updateField} options={['Ahorros', 'Corriente']} />
                            <BancoSelect 
                                value={formData.entidad_bancaria} 
                                onChange={updateField} 
                            />
                            <Input label="Número de Cuenta" name="numero_cuenta" value={formData.numero_cuenta} onChange={updateField} />`;

const replacementStr = `{tipoContraparte !== 'contado' && (
                                <>
                                    <div className="col-span-2 pt-4 border-t border-gray-100 mb-2 mt-4">
                                        <h3 className="text-sm font-bold text-[#254153] uppercase tracking-wider">Información Bancaria</h3>
                                    </div>
                                    <Select label="Tipo de Cuenta" name="tipo_cuenta" value={formData.tipo_cuenta} onChange={updateField} options={['Ahorros', 'Corriente']} />
                                    <BancoSelect 
                                        value={formData.entidad_bancaria} 
                                        onChange={updateField} 
                                    />
                                    <Input label="Número de Cuenta" name="numero_cuenta" value={formData.numero_cuenta} onChange={updateField} />
                                </>
                            )}`;
content = content.replace(targetStr, replacementStr);

// 5. Hide Actividad Economica Input
const actEconTarget = `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') ? (
                                <Input
                                    label="Actividad Económica"
                                    name="actividad_economica"
                                    value="0010 - Asalariados"
                                    onChange={() => {}}
                                    disabled={true}
                                />
                            ) : (`;
const actEconReplacement = `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') ? (
                                tipoContraparte !== 'contado' && (
                                    <Input
                                        label="Actividad Económica"
                                        name="actividad_economica"
                                        value="0010 - Asalariados"
                                        onChange={() => {}}
                                        disabled={true}
                                    />
                                )
                            ) : (`;
content = content.replace(actEconTarget, actEconReplacement);

// 6. Step 2 layout toggle + subtipo_contado
const step2TopTarget = `<div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">
                            {tipoContraparte === 'persona_natural' || (tipoContraparte === 'empleado' || tipoContraparte === 'contado')
                                ? 'Información Personal'
                                : 'Información de la Empresa'}
                        </h2>`;
const step2TopReplacement = `<div className="bg-white rounded-xl p-6 shadow-sm border">
                        {tipoContraparte === 'contado' && (
                            <div className="mb-6 grid grid-cols-2">
                                <Select 
                                    label="¿Es persona natural o jurídica?" 
                                    name="subtipo_contado" 
                                    value={formData.subtipo_contado || 'Persona Natural'} 
                                    onChange={updateField} 
                                    options={['Persona Natural', 'Persona Jurídica']} 
                                />
                            </div>
                        )}
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">
                            {tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado' || (tipoContraparte === 'contado' && formData.subtipo_contado !== 'Persona Jurídica')
                                ? 'Información Personal'
                                : 'Información de la Empresa'}
                        </h2>`;
content = content.replace(step2TopTarget, step2TopReplacement);

content = content.replace(
  /\{\(tipoContraparte === 'persona_natural' \|\| \(tipoContraparte === 'empleado' \|\| tipoContraparte === 'contado'\)\) \? \(/g,
  `{(tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado' || (tipoContraparte === 'contado' && formData.subtipo_contado !== 'Persona Jurídica')) ? (`
);

// 7. Hide Juridica fields
content = content.replace(
    /<Input label="Código CIIU" name="codigo_ciiu" value=\{formData\.codigo_ciiu\} onChange=\{updateField\} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="Código CIIU" name="codigo_ciiu" value={formData.codigo_ciiu} onChange={updateField} />}`
);
content = content.replace(
    /<Input label="Nombre Representante Legal" name="rep_legal_nombre_completo" value=\{formData\.rep_legal_nombre_completo\} className="col-span-2" onChange=\{updateField\} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="Nombre Representante Legal" name="rep_legal_nombre_completo" value={formData.rep_legal_nombre_completo} className="col-span-2" onChange={updateField} />}`
);
content = content.replace(
    /<Input label="CC Representante Legal" name="rep_legal_numero_identificacion" value=\{formData\.rep_legal_numero_identificacion\} onChange=\{updateField\} \/>/g,
    `{tipoContraparte !== 'contado' && <Input label="CC Representante Legal" name="rep_legal_numero_identificacion" value={formData.rep_legal_numero_identificacion} onChange={updateField} />}`
);
content = content.replace(
    /<Select label="Tipo Sociedad" name="tipo_sociedad" value=\{formData\.tipo_sociedad\} onChange=\{updateField\}\s*options=\{\['Anónima', 'Limitada', 'S\.A\.S\.', 'Sin Ánimo de Lucro', 'Otra'\]\} \/>/g,
    `{tipoContraparte !== 'contado' && <Select label="Tipo Sociedad" name="tipo_sociedad" value={formData.tipo_sociedad} onChange={updateField} options={['Anónima', 'Limitada', 'S.A.S.', 'Sin Ánimo de Lucro', 'Otra']} />}`
);
content = content.replace(
    /<Select label="Origen Capital" name="origen_capital" value=\{formData\.origen_capital\} onChange=\{updateField\}\s*options=\{\['Privada', 'Pública', 'Mixta'\]\} \/>/g,
    `{tipoContraparte !== 'contado' && <Select label="Origen Capital" name="origen_capital" value={formData.origen_capital} onChange={updateField} options={['Privada', 'Pública', 'Mixta']} />}`
);

// 8. Correo label
content = content.replace(
    /<Input label="Correo Facturación" name="correo_facturacion"/g,
    `<Input label={tipoContraparte === 'contado' ? "Correo" : "Correo Facturación"} name="correo_facturacion"`
);

// 9. Ciudad / Departamento updates
const ciudadDepReplacementStr = `<MunicipioSelect 
                                    label="Ciudad *"
                                    value={formData.ciudad} 
                                    onChange={(val) => {
                                        const parts = val.split(' - ');
                                        const city = parts.length > 1 ? parts[1].trim() : val;
                                        const dept = parts.length > 2 ? parts[2].trim() : '';
                                        updateField('ciudad', city);
                                        updateField('departamento', dept);
                                    }} 
                                />
                                <Input label="Departamento" name="departamento" value={formData.departamento} onChange={updateField} disabled={true} />`;
content = content.replace(
    /<Input label="Ciudad" name="ciudad" value=\{formData\.ciudad\} onChange=\{updateField\} list="ciudades-list" \/>\s*<Input label="Departamento" name="departamento" value=\{formData\.departamento\} onChange=\{updateField\} list="departamentos-list" \/>/g,
    ciudadDepReplacementStr
);

// 10. Validation fixes
const disabledTarget = `disabled={
                                    tipoContraparte === 'persona_juridica' 
                                    ? (!formData.razon_social || !formData.numero_identificacion || !formData.codigo_ciiu || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || !formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)
                                }`;

const disabledReplacement = `disabled={
                                    (tipoContraparte === 'persona_juridica' || (tipoContraparte === 'contado' && formData.subtipo_contado === 'Persona Jurídica')) 
                                    ? (!formData.razon_social || !formData.numero_identificacion || (tipoContraparte !== 'contado' && !formData.codigo_ciiu) || (tipoContraparte !== 'contado' && !formData.tipo_sociedad) || (tipoContraparte !== 'contado' && !formData.origen_capital) || !formData.correo_facturacion || !isValidEmail(formData.correo_facturacion) || !formData.ciudad || !formData.departamento || (tipoContraparte !== 'contado' && (!formData.rep_legal_nombre_completo || !formData.rep_legal_numero_identificacion)))
                                    : (!formData.tipo_documento || !formData.numero_identificacion || !formData.primer_nombre || !formData.primer_apellido || !formData.email || !isValidEmail(formData.email) || !formData.celular || !formData.direccion || !formData.ciudad || !formData.departamento)
                                }`;
content = content.replace(disabledTarget, disabledReplacement);

fs.writeFileSync(file, content);
console.log('Done');
