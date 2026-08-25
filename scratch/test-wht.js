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
    console.log('Session:', sid ? 'OK' : 'FAIL');
    const headers = { 'Cookie': `B1SESSION=${sid}`, 'Content-Type': 'application/json' };

    // 1. Check WithholdingTaxCodes
    const wht = await sapReq('https://200.7.96.194:50000/b1s/v1/WithholdingTaxCodes', 'GET', headers);
    console.log('WithholdingTaxCodes status:', wht.status, 'count:', wht.data?.value?.length || 0);
    if (wht.data?.value?.length > 0) {
        console.log('First 5:', wht.data.value.slice(0, 5));
    } else {
        console.log('wht.data:', wht.data);
    }

    // 2. Check BusinessPartner sample with WT
    const bps = await sapReq("https://200.7.96.194:50000/b1s/v1/BusinessPartners?$top=10&$select=CardCode,CardName,SubjectToWithholdingTax,BPWithholdingTaxCollection", 'GET', headers);
    console.log('BPs status:', bps.status);
    if (bps.data?.value) {
        for (const bp of bps.data.value) {
            if (bp.BPWithholdingTaxCollection && bp.BPWithholdingTaxCollection.length > 0) {
                console.log('BP with WT:', bp.CardCode, bp.CardName, bp.BPWithholdingTaxCollection);
            }
        }
    }
}
main().catch(console.error);
