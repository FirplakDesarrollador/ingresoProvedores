const https = require('https');
const fs = require('fs');
const agent = new https.Agent({ rejectUnauthorized: false });
const baseUrl = 'https://200.7.96.194:50000/b1s/v1';

function sapRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            agent,
        };
        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers }); }
                catch { resolve({ status: res.statusCode, data, headers: res.headers }); }
            });
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function main() {
    const loginRes = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    
    if (loginRes.status !== 200) { console.error('Login failed'); return; }
    const headers = { 'Cookie': `B1SESSION=${loginRes.data.SessionId}` };

    console.log('Fetching Banks...');
    const banksRes = await sapRequest(`${baseUrl}/Banks?$select=BankCode,BankName&$top=5000`, { headers });
    if (banksRes.status === 200) {
        fs.writeFileSync('src/lib/bancos_sap.json', JSON.stringify(banksRes.data.value, null, 2));
        console.log(`Saved ${banksRes.data.value.length} banks.`);
    } else {
        console.log('Error Banks:', banksRes.status, banksRes.data);
    }
    
    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
}
main().catch(console.error);
