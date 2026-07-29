const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
const baseUrl = 'https://200.7.96.194:50000/b1s/v1';

function sapRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { ...options, agent }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data }));
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
        const headers = { 'Cookie': `B1SESSION=${JSON.parse(loginRes.data).SessionId}` };
        
        console.log("Querying Metadata...");
        const res = await sapRequest(`${baseUrl}/$metadata`, { headers });
        const fs = require('fs');
        fs.writeFileSync('scratch/metadata.xml', res.data);
        console.log("Saved to scratch/metadata.xml");
    } catch(e) {
        console.error(e);
    }
}
run();
