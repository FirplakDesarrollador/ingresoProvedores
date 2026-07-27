const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
const baseUrl = 'https://200.7.96.194:50000/b1s/v1';

function sapRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { ...options, agent }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function run() {
    try {
        console.log("Logging into SAP...");
        const loginRes = await sapRequest(`${baseUrl}/Login`, {
            method: 'POST',
            body: JSON.stringify({
                CompanyDB: "Firplak_SA",
                Password: "2023Fir#.*",
                UserName: "manager"
            })
        });
        if (loginRes.status !== 200) return console.log("Login failed", loginRes.data);
        const headers = { 'Cookie': `B1SESSION=${loginRes.data.SessionId}` };
        
        console.log("Creating Test BP...");
        const payload = {
            CardCode: "PN-TEST-WT2",
            CardName: "Test Withholding Tax",
            CardType: "cSupplier",
            FederalTaxID: "123456789", // RUT
            DebitorAccount: "23359505",
            SubjectToWithholdingTax: "boYES",
            BPWithholdingTaxCollection: [
                { WTCode: "ACRE" }
            ]
        };

        const res = await sapRequest(`${baseUrl}/BusinessPartners`, { 
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log(res.status, JSON.stringify(res.data, null, 2));

        if(res.status === 201) {
            console.log("Checking BP...");
            const res2 = await sapRequest(`${baseUrl}/BusinessPartners('PN-TEST-WT2')?$select=SubjectToWithholdingTax,BPWithholdingTaxCollection`, { headers });
            console.log("Saved BP:", JSON.stringify(res2.data, null, 2));
            
            console.log("Cleaning up...");
            await sapRequest(`${baseUrl}/BusinessPartners('PN-TEST-WT2')`, { method: 'DELETE', headers });
        }

    } catch(e) {
        console.error(e);
    }
}
run();
