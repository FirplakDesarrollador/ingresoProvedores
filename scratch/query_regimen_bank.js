const https = require('https');
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
    
    console.log('Fetching Regimen Tributario HBT_REGIMTRIB...');
    const udfRes = await sapRequest(`${baseUrl}/U_HBT_REGIMTRIB`, { headers });
    if (udfRes.status === 200 && udfRes.data.value) {
        udfRes.data.value.forEach(r => {
            console.log(r);
        });
    } else {
        console.log('Error HBT_REGIMTRIB:', udfRes.status, udfRes.data);
    }
    
    console.log('Fetching BPBankAccounts structure for a BP...');
    const bpRes = await sapRequest(`${baseUrl}/BusinessPartners?$top=1&$select=CardCode,BPBankAccounts`, { headers });
    if (bpRes.status === 200 && bpRes.data.value) {
        console.log(JSON.stringify(bpRes.data.value[0].BPBankAccounts[0] || bpRes.data.value[0].BPBankAccounts, null, 2));
    } else {
        console.log('Error BPBankAccounts:', bpRes.status);
    }

    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
}
main().catch(console.error);
