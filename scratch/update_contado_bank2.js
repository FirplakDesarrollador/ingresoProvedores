const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

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

fs.writeFileSync(file, content);
console.log('Done');
