const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
function sapRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = https.request({
            hostname: parsedUrl.hostname, port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search, method: options.method || 'GET',
            headers: options.headers || {}, agent,
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}
async function main() {
    const data = {
        "tipo_solicitud": "Nacional",
        "tipo_documento": "NIT",
        "numero_identificacion": "901234567-8",
        "direccion": "Calle Falsa 123",
        "pais": "CO",
        "departamento": "05",
        "ciudad": "Medellin",
        "telefono1_numero": "3001234567",
        "celular": "3001234567",
        "email": "contacto@ficticio.com",
        "razon_social": "PROVEEDOR FICTICIO SAS",
        "tipo_sociedad": "S.A.S.",
        "codigo_ciiu": "1234",
        "tipo_cuenta": "AHORROS",
        "entidad_bancaria": "BANCOLOMBIA",
        "numero_cuenta": "987654321"
    };

    const isExtranjero = data.tipo_solicitud === 'Extranjero';
    const isJuridica = data.tipo_documento === 'NIT';
    const groupCode = isExtranjero ? 101 : 100;
    const paymentGroupNum = -1;
    const cleanNit = (data.numero_identificacion || '').replace(/[^0-9]/g, '');
    const cardCode = `AC${cleanNit}-01`;
    const cardName = (data.razon_social || data.primer_nombre || '').substring(0, 100);

    const bpPayload = {
        CardCode: cardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        GroupCode: groupCode,
        FederalTaxID: data.numero_identificacion || '',
        Phone1: data.telefono1_numero || '',
        Cellular: data.celular || '',
        EmailAddress: data.email || '',
        Currency: isExtranjero ? 'USD' : '$',
        PayTermsGrpCode: paymentGroupNum,
        DebitorAccount: '23359505',
        ContactEmployees: [],
        BPBankAccounts: [
            {
                BankCode: '99',
                AccountNo: data.numero_cuenta || '00000000',
                Country: 'CO'
            }
        ],
        U_HBT_TipDoc: '13',
        U_OK1_AC_ECO: data.codigo_ciiu || '',
        U_HBT_TipEnt: '2',
        U_HBT_Nombres: data.razon_social || '',
        U_HBT_Residente: isExtranjero ? 'NO' : 'SI',
        U_HBT_MailRecep_FE: data.email || '',
        U_HBT_ResFis1: '49',
        U_HBT_InfoTrib: 'ZZ',
    };

    if (data.direccion || data.ciudad) {
        const addressString = (data.direccion || 'Direccion Principal').substring(0, 50);
        const stateCode = data.departamento ? data.departamento.replace(/^0+/, '') : '';
        
        bpPayload.BPAddresses = [
            {
                AddressName: addressString,
                AddressName3: addressString,
                Street: addressString,
                City: data.ciudad || '',
                State: stateCode,
                Country: isExtranjero ? (data.pais || '') : 'CO',
                AddressType: 'bo_BillTo',
                U_HBT_MunMed: data.ciudad || '',
                U_HBT_DirMM: 'Y'
            },
            {
                AddressName: addressString + ' - E',
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

    const baseUrl = 'https://200.7.96.194:50000/b1s/v1';
    const login = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    if (login.status !== 200) return console.error("Login failed:", login.data);
    
    const headers = { 'Cookie': `B1SESSION=${login.data.SessionId}`, 'Content-Type': 'application/json' };
    
    console.log("Sending payload:", JSON.stringify(bpPayload, null, 2));
    const createRes = await sapRequest(`${baseUrl}/BusinessPartners`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bpPayload)
    });
    
    console.log(`Status: ${createRes.status}`);
    if(createRes.status !== 201) console.log("Response:", JSON.stringify(createRes.data, null, 2));
    else console.log("Success! CardCode:", createRes.data.CardCode);
}
main();
