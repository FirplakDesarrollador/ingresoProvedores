const https = require('https');
const fs = require('fs');
const path = require('path');
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
    console.log('Logging in to SAP...');
    const loginRes = await sapReq('https://200.7.96.194:50000/b1s/v1/Login', 'POST', 
        { 'Content-Type': 'application/json' },
        JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    );
    const sid = loginRes.data?.SessionId;
    if (!sid) {
        console.error('Login failed:', loginRes.data);
        return;
    }
    console.log('Login successful.');

    const headers = { 'Cookie': `B1SESSION=${sid}`, 'Content-Type': 'application/json' };

    let allWT = [];
    let nextPath = 'WithholdingTaxCodes?$select=WTCode,WTName,Rate,Inactive,Category,WithholdingType';

    while (nextPath) {
        const url = 'https://200.7.96.194:50000/b1s/v1/' + nextPath;
        console.log('Fetching:', nextPath);
        const res = await sapReq(url, 'GET', headers);
        if (res.data?.value) {
            allWT = allWT.concat(res.data.value);
        }
        if (res.data && res.data['odata.nextLink']) {
            nextPath = res.data['odata.nextLink'];
        } else {
            nextPath = null;
        }
    }

    console.log(`Fetched total ${allWT.length} withholding tax codes.`);

    // Filter only active or keep all? Usually users want active ones, but let's check Inactive flag
    // Let's format for retenciones_sap.json
    const formatted = allWT.map(x => ({
        WTCode: x.WTCode,
        WTName: x.WTName,
        Rate: x.Rate,
        Inactive: x.Inactive === 'tYES',
        Category: x.Category,
        WithholdingType: x.WithholdingType
    }));

    // Sort by WTCode
    formatted.sort((a, b) => a.WTCode.localeCompare(b.WTCode));

    console.log('Active codes count:', formatted.filter(x => !x.Inactive).length);
    console.log('Sample codes across list:');
    console.log(formatted.slice(0, 15));

    // Save complete list
    const targetFile = path.join(__dirname, '../src/lib/retenciones_sap.json');
    fs.writeFileSync(targetFile, JSON.stringify(formatted, null, 2));
    console.log(`Updated ${targetFile} successfully!`);
}

main().catch(console.error);
