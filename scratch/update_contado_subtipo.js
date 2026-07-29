const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// We introduce the select at the top of Step 2
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

// We replace the layout toggle condition
const layoutToggleTarget = `{(tipoContraparte === 'persona_natural' || (tipoContraparte === 'empleado' || tipoContraparte === 'contado')) ? (`
const layoutToggleReplacement = `{(tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado' || (tipoContraparte === 'contado' && formData.subtipo_contado !== 'Persona Jurídica')) ? (`

content = content.replace(layoutToggleTarget, layoutToggleReplacement);

fs.writeFileSync(file, content);
console.log('Done');
