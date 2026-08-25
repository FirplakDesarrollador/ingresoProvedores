const https = require('https');
const fs = require('fs');
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

    let allWT = [];
    let nextUrl = 'https://200.7.96.194:50000/b1s/v1/WithholdingTaxCodes?$select=WTCode,WTName,Rate,Inactive,Category,WithholdingType';
    
    while (nextUrl) {
        console.log('Fetching:', nextUrl);
        const res = await sapReq(nextUrl, 'GET', headers);
        if (res.data?.value) {
            allWT = allWT.concat(res.data.value);
        }
        if (res.data && res.data['@odata.nextLink']) {
            nextUrl = 'https://200.7.96.194:50000/b1s/v1/' + res.data['@odata.nextLink'];
        } else {
            nextUrl = null;
        }
    }

    console.log('Total WithholdingTaxCodes fetched:', allWT.length);
    const activeWT = allWT.filter(x => x.Inactive !== 'tYES');
    console.log('Active WithholdingTaxCodes:', activeWT.length);
    console.log('Inactive WithholdingTaxCodes:', allWT.length - activeWT.length);

    fs.writeFileSync('scratch/all_wht_sap.json', JSON.stringify(allWT, null, 2));
    console.log('Saved to scratch/all_wht_sap.json');
}

main().catch(console.error);
