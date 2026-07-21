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
    'Cash': -1,
    '60 días': 59,
    '60 days': 59,
    '75 días': 35,
    '75 days': 35,
    '90 días': 5,
    '90 days': 5,
}

// --- Mapeo de tipo_documento a UDF ---
const tipoDocMap: Record<string, string> = {
    'CC': '13',         // Cédula de Ciudadanía
    'NIT': '31',        // NIT
    'CE': '22',         // Cédula de Extranjería
    'PAS': '41',        // Pasaporte
    'TI': '12',         // Tarjeta de Identidad
    'FIDC': '22',       // Foreign ID Card → CE
    'IC': '13',         // Identity Card → CC
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
}

export async function createBusinessPartner(data: SapProveedorData): Promise<{ success: boolean; cardCode?: string; error?: string }> {
    const loginUrl = process.env.SAP_API_URL || "https://200.7.96.194:50000/b1s/v1/Login";
    const baseUrl = loginUrl.replace('/Login', '');

    // Determine name
    const isJuridica = data.tipo_contraparte === 'persona_juridica' || !!data.razon_social;
    const cardName = isJuridica
        ? (data.razon_social || 'SIN NOMBRE')
        : `${data.primer_nombre || ''} ${data.segundo_nombre || ''} ${data.primer_apellido || ''} ${data.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim() || 'SIN NOMBRE';

    // Determine CardCode — Use NIT with prefix P
    const cleanNit = (data.numero_identificacion || '').replace(/[^0-9]/g, '');
    const cardCode = `AC${cleanNit}-01`;

    // Determine if foreign
    const isExtranjero = data.tipo_solicitud?.includes('Extranjero') || 
                         (data.pais && data.pais !== 'CO' && data.pais !== 'Colombia');

    // GroupCode: 100=Proveedor Nacional, 101=Proveedor Exterior
    const groupCode = isExtranjero ? 101 : 100;

    // Payment Terms
    const paymentGroupNum = paymentTermsMap[data.dias_credito || ''] ?? -1;

    // Tipo entidad: 1=Natural, 2=Jurídica
    const tipoEntidad = isJuridica ? '2' : '1';

    console.log(`SAP BP: Creating ${cardCode} (${cardName}) - Group: ${groupCode}, Extranjero: ${isExtranjero}`);

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

    try {
        // 2. Check if BP already exists
        const checkUrl = `${baseUrl}/BusinessPartners?$filter=CardCode eq '${cardCode}'&$select=CardCode,CardName`;
        const checkRes = await sapRequestWithRetry(checkUrl, { headers: authHeaders });

        if (checkRes.status === 200 && checkRes.data.value && checkRes.data.value.length > 0) {
            console.log(`SAP BP: ${cardCode} already exists. Skipping creation.`);
            return { success: true, cardCode, error: 'BP already exists in SAP' };
        }

        // 3. Build Business Partner payload
        const bpPayload: any = {
            CardCode: cardCode,
            CardName: cardName,
            CardType: 'cSupplier',
            GroupCode: groupCode,
            FederalTaxID: data.numero_identificacion || '',
            Phone1: data.telefono1_numero || '',
            Cellular: data.celular || '',
            EmailAddress: data.email || data.correo_facturacion || '',
            Website: data.pagina_web || '',
            Currency: isExtranjero ? 'USD' : '$',
            PayTermsGrpCode: paymentGroupNum,
            DebitorAccount: '23359505',
            
            // Si hay persona de contacto, crearla en la lista de contactos
            ContactEmployees: (data.persona_contacto || data.rep_legal_nombre_completo) ? [
                {
                    Name: data.persona_contacto || data.rep_legal_nombre_completo,
                    Phone1: data.telefono1_numero || data.celular || '',
                    E_Mail: data.email || data.correo_facturacion || '',
                }
            ] : [],
            
            // Requerido por SAP (SP): Cuenta Bancaria
            BPBankAccounts: [
                {
                    BankCode: '99', // Código genérico o por defecto
                    AccountNo: data.numero_cuenta || '00000000',
                    Country: 'CO'
                }
            ],
            
            // UDFs
            U_HBT_TipDoc: tipoDocMap[data.tipo_documento || ''] || '',
            U_OK1_AC_ECO: data.codigo_ciiu || '',
            U_HBT_TipEnt: tipoEntidad,
            U_HBT_Nombres: isJuridica ? (data.razon_social || '') : (data.primer_nombre || ''),
            U_HBT_Residente: isExtranjero ? 'NO' : 'SI',
            U_HBT_MailRecep_FE: data.correo_facturacion || data.email || '',
            U_HBT_ResFis1: '49',  // No aplica - Otros default
            U_HBT_InfoTrib: 'ZZ', // No Aplica default
        };

        // Nombre / Apellidos for persona natural
        if (!isJuridica) {
            bpPayload.U_HBT_Nombres = data.primer_nombre || '';
            // Note: SAP UDF for apellidos may need to be set via separate fields
        }

        // Address
        if (data.direccion || data.ciudad) {
            const addressString = (data.direccion || 'Direccion Principal').substring(0, 50);
            const stateCode = data.departamento ? data.departamento.replace(/^0+/, '') : ''; // SAP usa '5' en lugar de '05'
            
            bpPayload.BPAddresses = [
                {
                    AddressName: addressString,
                    AddressName3: addressString, // Nombre de dirección 3
                    Street: addressString,
                    City: data.ciudad || '',
                    State: stateCode, // Departamento (SAP Code)
                    Country: isExtranjero ? (data.pais || '') : 'CO',
                    AddressType: 'bo_BillTo',
                    U_HBT_MunMed: data.ciudad || '', // Municipio
                    U_HBT_DirMM: 'Y' // Es dirección MM (Sí)
                },
                {
                    AddressName: addressString + ' - E', // Para diferenciar ENVIO
                    AddressName3: addressString,
                    Street: addressString,
                    City: data.ciudad || '',
                    State: stateCode,
                    Country: isExtranjero ? (data.pais || '') : 'CO',
                    AddressType: 'bo_ShipTo',
                    U_HBT_MunMed: data.ciudad || '',
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
