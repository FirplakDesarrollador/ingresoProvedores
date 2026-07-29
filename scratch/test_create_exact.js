const https = require('https');

const baseUrl = "https://200.7.96.194:50000/b1s/v1";
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function sapRequest(url, options) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            agent: insecureAgent,
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed;
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

async function run() {
    const loginRes = await sapRequest(baseUrl + "/Login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            CompanyDB: "Firplak_SA",
            Password: "2023Fir#.*",
            UserName: "manager",
        }),
    });

    const sessionId = loginRes.data.SessionId;
    const authHeaders = { 
        'Cookie': `B1SESSION=${sessionId}`, 
        'Content-Type': 'application/json' 
    };

    const cardCode = 'AC1231231232-01';

    const bpPayload = {
            CardCode: cardCode,
            CardName: "adfsd asdasd sadvsad",
            CardType: 'cSupplier',
            GroupCode: 100,
            FederalTaxID: "123123123231231312",
            Phone1: "",
            Cellular: "123123",
            EmailAddress: "analistacomasdfasdercial@firplak.com",
            Website: "",
            Currency: "$",
            PayTermsGrpCode: -1,
            DebitorAccount: "23359505",
            ContactEmployees: [],
            BPBankAccounts: [
                {
                    BankCode: "30",
                    AccountNo: "123412341234",
                    ControlKey: "02",
                    Country: "CO",
                    BPCode: cardCode,
                    AccountName: "adfsd asdasd sadvsad"
                }
            ],
            U_HBT_TipDoc: "22",
            U_OK1_AC_ECO: "0010",
            U_HBT_ActEco: "0010",
            U_HBT_TipEnt: "1",
            U_HBT_Residente: "SI",
            U_HBT_MailRecep_FE: "analistacomasdfasdercial@firplak.com",
            U_HBT_ResFis1: "49",
            U_HBT_ResFis2: "49",
            U_HBT_InfoTrib: "ZZ",
            U_HBT_Nacional: "1",
            U_HBT_RegFis: "49",
            U_HBT_RegTrib: "05",
            U_HBT_MedPag: "47",
            U_HBT_MunMed: "05001",
            U_HBT_Nombres: "adfsd",
            U_HBT_Apellido1: "asdasd",
            U_HBT_Apellido2: "sadvsad",
            BPAddresses: [
                {
                    AddressName: "MEDELLÍN",
                    AddressName3: "MEDELLÍN",
                    Street: "asdasdadasd",
                    City: "MEDELLÍN",
                    State: "5",
                    Country: "CO",
                    AddressType: "bo_BillTo",
                    U_HBT_MunMed: "MEDELLÍN",
                    U_HBT_DirMM: "Y"
                },
                {
                    AddressName: "MEDELLÍN - E",
                    AddressName3: "MEDELLÍN",
                    Street: "asdasdadasd",
                    City: "MEDELLÍN",
                    State: "5",
                    Country: "CO",
                    AddressType: "bo_ShipTo",
                    U_HBT_MunMed: "MEDELLÍN",
                    U_HBT_DirMM: "Y"
                }
            ]
        };

    const checkUrl = `${baseUrl}/BusinessPartners?$filter=CardCode eq '${cardCode}'`;
    const checkRes = await sapRequest(checkUrl, { headers: authHeaders });

    if (checkRes.status === 200 && checkRes.data.value && checkRes.data.value.length > 0) {
        console.log("ALREADY EXISTS", checkRes.data.value);
    } else {
        const createUrl = `${baseUrl}/BusinessPartners`;
        const createRes = await sapRequest(createUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(bpPayload),
        });
        console.log("CREATE STATUS", createRes.status);
        console.log("CREATE DATA", JSON.stringify(createRes.data, null, 2));
    }
}

run();
