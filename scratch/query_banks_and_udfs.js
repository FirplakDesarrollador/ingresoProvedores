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

    console.log('Fetching CRD2 UDFs...');
    const crd2Res = await sapRequest(`${baseUrl}/UserFieldsMD?$filter=TableName eq 'CRD2'`, { headers });
    if (crd2Res.status === 200 && crd2Res.data.value) {
        crd2Res.data.value.forEach(udf => console.log(`U_${udf.Name} (${udf.Description})`));
    }
    
    console.log('Fetching Regimen Tributario Valid Values...');
    const udfRes = await sapRequest(`${baseUrl}/UserFieldsMD?$filter=TableName eq 'OCRD' and startswith(Name, 'HBT_Reg')`, { headers });
    if (udfRes.status === 200 && udfRes.data.value) {
        udfRes.data.value.forEach(udf => {
            console.log(`U_${udf.Name} (${udf.Description}) - LinkedTable: ${udf.LinkedTable}`);
        });
    }

    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
}
main().catch(console.error);
