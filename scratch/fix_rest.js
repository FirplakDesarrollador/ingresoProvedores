const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: useEffect logic
content = content.replace(
    /if \(tipo === 'empleado'\) \{([\s\S]*?)setFormData\(prev => \(\{([\s\S]*?)\}\)\)/,
    `if (tipo === 'empleado' || tipo === 'contado') {$1setFormData(prev => ({$2,
                area_solicitante: 'Otros',
                dias_credito: 'Crédito a 30 días',
                tipo_provision: 'Prestación de Servicios (Ej: Trabajos, mantenimientos o actividades dentro/fuera de la empresa)',
                detalle_servicio: tipo === 'empleado' ? 'Servicios personales' : 'Servicios generales',
                ...(tipo === 'contado' ? {
                    tipo_cuenta: 'Ahorros',
                    entidad_bancaria: 'CITIBANK',
                    numero_cuenta: '1231231212'
                } : {})
            }))`
);
content = content.replace(/setTipoContraparte\('empleado'\)/, `setTipoContraparte(tipo as any)`);

// Fix 2: Hide Atrás in Step 2
content = content.replace(
    /<button onClick=\{\(\) => setStep\(1\)\} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás<\/button>/g,
    `{tipoContraparte !== 'empleado' && tipoContraparte !== 'contado' && <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl">Atrás</button>}`
);

// Fix 3: Subtipo Contado and Headings
const step2TopTarget = `<div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">
                            {tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado'
                                ? 'Información Personal'
                                : 'Información de la Empresa'}
                        </h2>

                        {(tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado') ? (`;

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
                        </h2>

                        {(tipoContraparte === 'persona_natural' || tipoContraparte === 'empleado' || (tipoContraparte === 'contado' && formData.subtipo_contado !== 'Persona Jurídica')) ? (`;
content = content.replace(step2TopTarget, step2TopReplacement);

// Fix 4: overlap and TipoContraparte
content = content.replace(
    /\{tipoContraparte === 'empleado' && \(/g,
    `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') && (`
);

content = content.replace(
    /\{tipoContraparte === 'empleado' \? \(/g,
    `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') ? (`
);

content = content.replace(
    /type TipoContraparte = 'persona_natural' \| 'persona_juridica' \| 'empleado' \| 'extranjero' \| ''/,
    `type TipoContraparte = 'persona_natural' | 'persona_juridica' | 'empleado' | 'extranjero' | 'contado' | ''`
);

fs.writeFileSync(file, content);
console.log('Done 2');
