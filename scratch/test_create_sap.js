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
    const baseUrl = 'https://200.7.96.194:50000/b1s/v1';
    
    console.log("1. Logging in...");
    const login = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    
    if (login.status !== 200) {
        console.error("Login failed:", login.data);
        return;
    }
    
    const headers = { 
        'Cookie': `B1SESSION=${login.data.SessionId}`,
        'Content-Type': 'application/json'
    };
    
    // Minimum payload based on our fixes
    let bpPayload = {
        CardCode: 'AC51616162-01',
        CardName: 'pruebaesteban 2 Ficticio',
        CardType: 'cSupplier',
        GroupCode: 100, // Nacional
        FederalTaxID: '51616162',
        Phone1: '3000000001',
        Cellular: '3000000001',
        EmailAddress: 'test2@ficticio.com',
        Currency: '$',
        DebitorAccount: '23359505',
        ContactEmployees: [
            {
                Name: 'Esteban Test Dos',
                Phone1: '3000000001',
                E_Mail: 'test2@ficticio.com'
            }
        ],
        BPBankAccounts: [
            {
                BankCode: '99',
                AccountNo: '123456789',
                Country: 'CO'
            }
        ]
    };
    
    console.log("2. Attempting to create Business Partner...", bpPayload.CardCode);
    const createRes = await sapRequest(`${baseUrl}/BusinessPartners`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bpPayload)
    });
    
    console.log(`Status: ${createRes.status}`);
    console.log("Response:", JSON.stringify(createRes.data, null, 2));
}

main();
