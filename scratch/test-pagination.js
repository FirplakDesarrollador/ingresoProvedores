const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function sapReq(url, method = 'GET', headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = https.request({
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method,
            headers,
            agent
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch(e) { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    const loginRes = await sapReq('https://200.7.96.194:50000/b1s/v1/Login', 'POST', 
        { 'Content-Type': 'application/json' },
        JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    );
    const sid = loginRes.data.SessionId;
    const headers = { 'Cookie': `B1SESSION=${sid}`, 'Content-Type': 'application/json' };

    // 1. Raw response keys of first page
    const page1 = await sapReq('https://200.7.96.194:50000/b1s/v1/WithholdingTaxCodes?$select=WTCode,WTName', 'GET', headers);
    console.log('Page 1 keys:', Object.keys(page1.data));
    console.log('Page 1 count:', page1.data.value?.length);
    for (const key of Object.keys(page1.data)) {
        if (key !== 'value') console.log(key, ':', page1.data[key]);
    }

    // 2. Try with $skip=20
    const page2 = await sapReq('https://200.7.96.194:50000/b1s/v1/WithholdingTaxCodes?$select=WTCode,WTName&$skip=20', 'GET', headers);
    console.log('Page 2 ($skip=20) count:', page2.data.value?.length);
    if (page2.data.value?.length > 0) {
        console.log('Page 2 items:', page2.data.value.slice(0, 5));
    }
}
main().catch(console.error);
