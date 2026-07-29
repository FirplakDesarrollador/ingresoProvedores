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
        
        console.log("Fetching PN6767676-01...");
        const res = await sapRequest(`${baseUrl}/BusinessPartners('PN6767676-01')?$select=SubjectToWithholdingTax,BPWithholdingTaxCollection,U_HBT_Retencion`, { headers });
        console.log("Data:", JSON.stringify(res.data, null, 2));

        // Let's also fetch a general one that has withholding tax collection
        const res2 = await sapRequest(`${baseUrl}/BusinessPartners?$top=1&$filter=SubjectToWithholdingTax eq 'boYES'`, { headers });
        console.log("Another BP:", res2.data.value ? res2.data.value.map(b => b.CardCode) : res2.data);
    } catch(e) {
        console.error(e);
    }
}
run();
