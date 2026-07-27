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

    console.log('Fetching PaymentTermsTypes...');
    const ptRes = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName`, { headers });
    if (ptRes.status === 200 && ptRes.data.value) {
        ptRes.data.value.forEach(pt => {
            console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName}`);
        });
    } else {
        console.log('Error:', ptRes.status, ptRes.data);
    }
    
    const ptRes2 = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName&$skip=20`, { headers });
    if (ptRes2.status === 200 && ptRes2.data.value) {
        ptRes2.data.value.forEach(pt => {
            console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName}`);
        });
    }
    
    const ptRes3 = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName&$skip=40`, { headers });
    if (ptRes3.status === 200 && ptRes3.data.value) {
        ptRes3.data.value.forEach(pt => {
            console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName}`);
        });
    }

    const ptRes4 = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName&$skip=60`, { headers });
    if (ptRes4.status === 200 && ptRes4.data.value) {
        ptRes4.data.value.forEach(pt => {
            console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName}`);
        });
    }
    
    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
}
main().catch(console.error);
