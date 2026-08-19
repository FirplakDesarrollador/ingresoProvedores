'use server'

/**
 * SAP Service Layer - Business Partner Integration
 * Creates Business Partners (Socios de Negocios) in SAP when a provider is approved.
 */

import https from 'https';

// Custom HTTPS agent that skips certificate validation (SAP uses self-signed certs)
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function sapRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: string }): Promise<{ status: number; data: any; headers: any }> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            agent: insecureAgent,
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk: string) => { data += chunk; });
            res.on('end', () => {
                let parsed: any;
                try { parsed = JSON.parse(data); }
                catch { parsed = data; }
                resolve({ status: res.statusCode || 500, data: parsed, headers: res.headers });
            });
        });

        req.on('error', (err) => reject(err));
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function sapRequestWithRetry(url: string, options: { method?: string; headers?: Record<string, string>; body?: string }, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await sapRequest(url, options);
        } catch (err: any) {
            if (i < retries - 1) {
                const delay = 1000 * Math.pow(2, i);
                console.warn(`SAP Request Attempt ${i + 1} failed (${err.message}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error(`SAP request failed after ${retries} retries`);
}

// --- Mapeo de dias_credito a SAP PaymentTermsGroupNumber ---
const paymentTermsMap: Record<string, number> = {
    'Contado': -1,
    'Crédito a 30 días': 2,
    'Crédito a 60 días': 4,
    'Crédito a 90 días': 5, // mapped to '90 días'
    '30 días': 2,
    '60 días': 4,
    '90 días': 5,
}

import bancosSap from './bancos_sap.json'

// Fallback legacy mappings just in case
const bankCodeMapLegacy: Record<string, string> = {
    'NEQUI': '07',         // Opera bajo Bancolombia
    'DAVIPLATA': '51',     // Opera bajo Davivienda
    'SCOTIABANK': '08',
    'COLPATRIA': '19',
    'CAJA SOCIAL': '32'
}


const tipoDocMap: Record<string, string> = {
    'CC': '13',
    'Cédula de Ciudadanía': '13',
    'NIT': '31',
    'CE': '22',
    'Cédula de Extranjería': '22',
    'PAS': '41',
    'Pasaporte': '41',
    'TI': '12',
    'Tarjeta de Identidad': '12',
    'FIDC': '22',
    'IC': '13',
    'Otro': '',
}

const regimenTribMap: Record<string, string> = {
    'Especial': '06',
    'Extranjero': '04',
    'Gran Contribuyente': '03',
    'N/A': '05',
    'Régimen Común': 'RC',
    'Régimen Simplificado': 'RS'
}


// --- Mapeo de Departamentos a SAP State Codes ---
const departamentosMap: Record<string, string> = {
    'ANTIOQUIA': '5',
    'ATLANTICO': '8',
    'BOGOTA': '11',
    'BOGOTA D.C.': '11',
    'BOLIVAR': '13',
    'BOYACA': '15',
    'CALDAS': '17',
    'CAQUETA': '18',
    'CAUCA': '19',
    'CESAR': '20',
    'CORDOBA': '23',
    'CUNDINAMARCA': '25',
    'CHOCO': '27',
    'HUILA': '41',
    'LA GUAJIRA': '44',
    'GUAJIRA': '44',
    'MAGDALENA': '47',
    'META': '50',
    'NARIÑO': '52',
    'NORTE DE SANTANDER': '54',
    'QUINDIO': '63',
    'RISARALDA': '66',
    'SANTANDER': '68',
    'SUCRE': '70',
    'TOLIMA': '73',
    'VALLE DEL CAUCA': '76',
    'VALLE': '76',
    'ARAUCA': '81',
    'CASANARE': '85',
    'PUTUMAYO': '86',
    'SAN ANDRES': '88',
    'AMAZONAS': '91',
    'GUAINIA': '94',
    'GUAVIARE': '95',
    'VAUPES': '97',
    'VICHADA': '99',
}

// --- Normalización de ciudades con tilde en mayúsculas ---
const ciudadesMap: Record<string, string> = {
    'MEDELLIN': 'MEDELLÍN',
    'BOGOTA': 'BOGOTÁ',
    'CALI': 'CALI',
    'BARRANQUILLA': 'BARRANQUILLA',
    'BUCARAMANGA': 'BUCARAMANGA',
    'PEREIRA': 'PEREIRA',
    'MANIZALES': 'MANIZALES',
    'CARTAGENA': 'CARTAGENA',
    'CUCUTA': 'CÚCUTA',
    'IBAGUE': 'IBAGUÉ',
    'MONTERIA': 'MONTERÍA',
    'VILLAVICENCIO': 'VILLAVICENCIO',
    'PASTO': 'PASTO',
    'NEIVA': 'NEIVA',
    'ARMENIA': 'ARMENIA',
    'SANTA MARTA': 'SANTA MARTA',
    'POPAYAN': 'POPAYÁN',
    'VALLEDUPAR': 'VALLEDUPAR',
    'SINCELEJO': 'SINCELEJO',
    'TUNJA': 'TUNJA',
    'FLORENCIA': 'FLORENCIA',
    'MOCOA': 'MOCOA',
    'YOPAL': 'YOPAL',
    'QUIBDO': 'QUIBDÓ',
    'RIOHACHA': 'RIOHACHA',
    'SAN ANDRES': 'SAN ANDRÉS',
    'LETICIA': 'LETICIA',
    'PUERTO INIRIDA': 'PUERTO INÍRIDA',
    'SAN JOSE DEL GUAVIARE': 'SAN JOSÉ DEL GUAVIARE',
    'MITU': 'MITÚ',
    'PUERTO CARRENO': 'PUERTO CARREÑO',
    'ARAUCA': 'ARAUCA',
}

export interface SapProveedorData {
    // Core
    numero_identificacion: string
    razon_social?: string | null
    primer_nombre?: string | null
    segundo_nombre?: string | null
    primer_apellido?: string | null
    segundo_apellido?: string | null
    tipo_contraparte?: string | null
    tipo_documento?: string | null

    // Contact
    telefono1_numero?: string | null
    celular?: string | null
    email?: string | null
    correo_facturacion?: string | null
    pagina_web?: string | null
    persona_contacto?: string | null

    // Address
    direccion?: string | null
    ciudad?: string | null
    departamento?: string | null
    pais?: string | null

    // Legal
    rep_legal_nombre_completo?: string | null
    tipo_sociedad?: string | null
    codigo_ciiu?: string | null
    origen_capital?: string | null

    // Banking
    entidad_bancaria?: string | null
    numero_cuenta?: string | null
    tipo_cuenta?: string | null
    swift_code?: string | null
    aba_code?: string | null

    // Other
    dias_credito?: string | null
    tipo_solicitud?: string | null
    regimen_fiscal?: string | null
    regimen_tributario?: string | null
    actividad_economica?: string | null
    nacionalidad?: string | null
    municipio_med_mag?: string | null
    tipo_extranjero?: string | null
    
    // Contabilidad
    grupo_bp?: string | null
    cuenta_asociada?: string | null
    aplica_retenciones?: boolean
    sujeto_a_retencion?: boolean
    codigos_retencion?: string[]
}

// Helper: resolve bank name to SAP BankCode
function resolveBankCode(bankName: string): string {
    if (!bankName) return '99';
    const upper = bankName.toUpperCase().trim();
    
    // Legacy / Aliases
    if (bankCodeMapLegacy[upper]) return bankCodeMapLegacy[upper];
    
    // Exact match from SAP list
    const exact = bancosSap.find((b: any) => b.BankName.toUpperCase() === upper);
    if (exact) return exact.BankCode;
    
    // Partial match from SAP list
    const partialMatch = bancosSap.find((b: any) => 
        upper.includes(b.BankName.toUpperCase()) || b.BankName.toUpperCase().includes(upper)
    );
    if (partialMatch) return partialMatch.BankCode;
    
    return '99'; // OTROS BANCOS
}

export async function createBusinessPartner(data: SapProveedorData): Promise<{ success: boolean; cardCode?: string; error?: string }> {
    const loginUrl = process.env.SAP_API_URL || "https://200.7.96.194:50000/b1s/v1/Login";
    const baseUrl = loginUrl.replace('/Login', '');

    // Determine name
    const isEmpleado = data.tipo_contraparte === 'empleado';
    const isJuridica = !isEmpleado && (data.tipo_contraparte === 'persona_juridica' || (!!data.razon_social && !data.primer_nombre));
    const cardName = (isJuridica
        ? (data.razon_social || 'SIN NOMBRE')
        : (isEmpleado
            ? `${data.primer_apellido || ''} ${data.segundo_apellido || ''} ${data.primer_nombre || ''} ${data.segundo_nombre || ''}`
            : `${data.primer_nombre || ''} ${data.segundo_nombre || ''} ${data.primer_apellido || ''} ${data.segundo_apellido || ''}`))
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase() || 'SIN NOMBRE';

    // Determine if foreign
    const isExtranjero = data.tipo_solicitud?.includes('Extranjero') || 
                         (data.pais && data.pais !== 'CO' && data.pais !== 'Colombia');

    // Determine CardCode — prefix + NIT + suffix -01 (max 15 chars for SAP)
    const cleanNit = (data.numero_identificacion || '').replace(/[^a-zA-Z0-9]/g, '');
    let prefix = 'AC'; // default to AC
    
    if (data.tipo_contraparte === 'empleado') {
        prefix = 'EM';
    } else if (data.tipo_contraparte === 'contado') {
        prefix = 'AC';
    } else {
        if (data.grupo_bp === 'Proveedor Nacional') prefix = 'PN';
        else if (data.grupo_bp === 'Proveedor de Servicios') prefix = 'AC';
        
        if (isExtranjero) prefix = 'PE'; // always PE for foreign
    }

    const suffix = '-01';
    const maxNitLen = 15 - prefix.length - suffix.length; // = 10
    const truncatedNit = cleanNit.substring(0, maxNitLen);
    const cardCode = `${prefix}${truncatedNit}${suffix}`;

    // GroupCode: 100=Proveedor Nacional, 101=Proveedor Exterior, 102=Proveedor Servicios, 112=Empleados
    let groupCode = 100;
    if (data.tipo_contraparte === 'empleado') {
        groupCode = 112;
    } else if (data.tipo_contraparte === 'contado') {
        groupCode = 102;
    } else if (isExtranjero) {
        groupCode = 101;
    } else if (data.grupo_bp === 'Proveedor de Servicios') {
        groupCode = 102;
    }

    // Payment Terms
    const isContado = data.tipo_contraparte === 'contado';
    const paymentGroupNum = isContado ? -1 : (paymentTermsMap[data.dias_credito || ''] ?? -1);

    // Tipo entidad: 1=Natural, 2=Jurídica
    const tipoEntidad = isJuridica ? '2' : '1';

    console.log(`SAP BP: Creating/Updating ${cardCode} (${cardName}) - Group: ${groupCode}, Extranjero: ${isExtranjero}`);

    // 1. LOGIN
    const loginRes = await sapRequestWithRetry(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            CompanyDB: (process.env.SAP_COMPANY_DB || "Firplak_SA").trim(),
            Password: (process.env.SAP_PASSWORD || "2023Fir#.*").trim(),
            UserName: (process.env.SAP_USERNAME || "manager").trim(),
        }),
    });

    if (loginRes.status !== 200) {
        console.error('SAP Login Error:', loginRes.data);
        return { success: false, error: `SAP Login failed: ${JSON.stringify(loginRes.data)}` };
    }

    const sessionId = loginRes.data.SessionId;
    const authHeaders = { 
        'Cookie': `B1SESSION=${sessionId}`, 
        'Content-Type': 'application/json' 
    };

    // 2. Build Business Partner payload
    const bpPayload: any = {
        CardCode: cardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        GroupCode: groupCode,
        FederalTaxID: data.numero_identificacion || '',
        Phone1: (data.telefono1_numero || '').trim(),
        Cellular: (data.celular || '').trim(),
        EmailAddress: data.email || data.correo_facturacion || '',
        Website: data.pagina_web || '',
        Currency: isExtranjero ? 'USD' : '$',
        PayTermsGrpCode: paymentGroupNum,
        DebitorAccount: data.cuenta_asociada || '23359505',
        
        // Si hay persona de contacto, crearla en la lista de contactos
        ContactEmployees: (data.persona_contacto || data.rep_legal_nombre_completo) ? [
            {
                Name: (data.persona_contacto || data.rep_legal_nombre_completo || '').toUpperCase().trim(),
                Phone1: data.telefono1_numero || data.celular || '',
                E_Mail: data.email || data.correo_facturacion || '',
            }
        ] : [],
        
        // Requerido por SAP (SP): Cuenta Bancaria
        ...(data.aplica_retenciones && {
            SubjectToWithholdingTax: data.sujeto_a_retencion ? 'boYES' : 'boNO',
            BPWithholdingTaxCollection: (data.codigos_retencion || []).map(wt => ({ WTCode: wt }))
        }),
        BPBankAccounts: [
            {
                BankCode: isExtranjero ? '99' : (isContado ? '99' : resolveBankCode(data.entidad_bancaria || '')),
                AccountNo: isContado ? '00' : (data.numero_cuenta || '00000000'),
                ControlKey: isContado ? '02' : (data.tipo_cuenta === 'Corriente' ? '01' : '02'),
                Country: isExtranjero ? 'CO' : 'CO',
                BPCode: cardCode,
                AccountName: cardName,
            }
        ],
        
        // UDFs
        U_HBT_TipDoc: isExtranjero ? '43' : (isContado ? '31' : (tipoDocMap[data.tipo_documento || (isJuridica ? 'NIT' : '')] || '').substring(0, 2)),
        U_OK1_AC_ECO: (isContado || isExtranjero) ? '' : (data.codigo_ciiu || '').substring(0, 4),
        U_HBT_ActEco: (isContado || isExtranjero) ? '' : (data.codigo_ciiu || '').substring(0, 10),
        U_HBT_TipEnt: tipoEntidad,
        U_HBT_Residente: isExtranjero ? 'NO' : 'SI',
        U_HBT_MailRecep_FE: (data.correo_facturacion || data.email || '').substring(0, 100),
        U_HBT_ResFis1: '49',  // No aplica - Otros default
        U_HBT_ResFis2: '49',
        U_HBT_InfoTrib: 'ZZ', // No Aplica default
        U_HBT_Nacional: (data.nacionalidad === 'Internacional' || isExtranjero) ? '2' : '1',
        U_HBT_RegFis: isExtranjero ? '49' : (data.regimen_fiscal || '').split(' - ')[0].trim(),
        U_HBT_RegTrib: isExtranjero ? '05' : (regimenTribMap[data.regimen_tributario || ''] || ''),
        U_HBT_MedPag: '47', // Hardcoded per user request
        U_HBT_MunMed: isExtranjero ? '05001' : (data.municipio_med_mag || ''),
    };

    // Nombres / Apellidos
    if (!isJuridica) {
        bpPayload.U_HBT_Nombres = [data.primer_nombre || '', data.segundo_nombre || ''].filter(Boolean).join(' ').substring(0, 50).toUpperCase().trim();
        bpPayload.U_HBT_Apellido1 = (data.primer_apellido || '').substring(0, 30).toUpperCase().trim();
        bpPayload.U_HBT_Apellido2 = (data.segundo_apellido || '').substring(0, 30).toUpperCase().trim();
    } else {
        bpPayload.U_HBT_Nombres = '';
        bpPayload.U_HBT_Apellido1 = '';
        bpPayload.U_HBT_Apellido2 = '';
    }

    try {
        // 3. Check if BP already exists
        const checkUrl = `${baseUrl}/BusinessPartners?$filter=CardCode eq '${cardCode}'&$select=CardCode,CardName`;
        const checkRes = await sapRequestWithRetry(checkUrl, { headers: authHeaders });

        if (checkRes.status === 200 && checkRes.data.value && checkRes.data.value.length > 0) {
            console.log(`SAP BP: ${cardCode} already exists. Updating CardName and data via PATCH...`);
            const updateUrl = `${baseUrl}/BusinessPartners('${cardCode}')`;
            const patchRes = await sapRequestWithRetry(updateUrl, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({
                    CardName: cardName,
                    U_HBT_Nombres: bpPayload.U_HBT_Nombres,
                    U_HBT_Apellido1: bpPayload.U_HBT_Apellido1,
                    U_HBT_Apellido2: bpPayload.U_HBT_Apellido2,
                })
            });
            console.log(`SAP BP PATCH Response status: ${patchRes.status}`);
            return { success: true, cardCode };
        }

        // Address
        if (data.direccion || data.ciudad || data.municipio_med_mag) {
            const addressString = (data.direccion || '').toUpperCase().substring(0, 50);
            
            // Map the department to SAP State Code
            let stateCode = '';
            if (!isExtranjero && data.departamento) {
                const depUpper = data.departamento.toUpperCase().trim();
                if (departamentosMap[depUpper]) {
                    stateCode = departamentosMap[depUpper];
                } else if (/^\d+$/.test(depUpper)) {
                    const numCode = parseInt(depUpper, 10);
                    // Only accept valid SAP state codes (typically 1 to 99)
                    if (numCode >= 1 && numCode <= 99) {
                        stateCode = numCode.toString();
                    }
                } else {
                    // Try to find a partial match (e.g. "ANTIQUIA" ≈ "ANTIOQUIA")
                    const matchedKey = Object.keys(departamentosMap).find(k => 
                        k.length >= 4 && (k.startsWith(depUpper.substring(0, 4)) || depUpper.startsWith(k.substring(0, 4)))
                    );
                    if (matchedKey) {
                        stateCode = departamentosMap[matchedKey];
                    }
                }
            }
            
            const cityRaw = (data.ciudad || data.municipio_med_mag || '').toUpperCase().trim();
            const cityUpper = ciudadesMap[cityRaw] || cityRaw;
            bpPayload.BPAddresses = [
                {
                    AddressName: addressString || cityUpper,
                    AddressName3: addressString || cityUpper,
                    Street: addressString,
                    City: cityUpper,
                    State: stateCode.substring(0, 3), // Departamento (SAP Code) max 3 chars
                    Country: isExtranjero ? (data.pais || '') : 'CO',
                    AddressType: 'bo_BillTo',
                    U_HBT_MunMed: cityUpper, // Municipio en mayúsculas
                    U_HBT_DirMM: 'Y' // Es dirección MM (Sí)
                },
                {
                    AddressName: (addressString || cityUpper) + ' - E', // Para diferenciar ENVIO
                    AddressName3: addressString || cityUpper,
                    Street: addressString,
                    City: cityUpper,
                    State: stateCode.substring(0, 3),
                    Country: isExtranjero ? (data.pais || '') : 'CO',
                    AddressType: 'bo_ShipTo',
                    U_HBT_MunMed: cityUpper,
                    U_HBT_DirMM: 'Y'
                }
            ];
        }

        // 4. Create Business Partner
        console.log(`SAP BP: Sending POST to BusinessPartners...`);
        const createUrl = `${baseUrl}/BusinessPartners`;
        const createRes = await sapRequestWithRetry(createUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(bpPayload),
        });

        if (createRes.status === 201 || createRes.status === 200) {
            console.log(`SAP BP: ✅ Created successfully: ${cardCode} (${cardName})`);
            return { success: true, cardCode };
        } else {
            const errorMsg = typeof createRes.data === 'object' 
                ? JSON.stringify(createRes.data) 
                : String(createRes.data);
            console.error(`SAP BP: ❌ Failed to create ${cardCode}:`, errorMsg);
            return { success: false, cardCode, error: `SAP Error (${createRes.status}): ${errorMsg}` };
        }
    } finally {
        // 5. Logout
        try {
            await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers: authHeaders });
        } catch { /* ignore logout errors */ }
    }
}
