// Script to get remaining UDFs and Payment Terms from SAP
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

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
    const baseUrl = 'https://200.7.96.194:50000/b1s/v1';
    
    const loginRes = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    
    if (loginRes.status !== 200) { console.error('Login failed'); return; }
    const headers = { 'Cookie': `B1SESSION=${loginRes.data.SessionId}` };

    // Get ALL UDFs (skip first 20 we already got)
    console.log('--- Remaining UDFs for OCRD (skip 20) ---');
    const udfRes = await sapRequest(`${baseUrl}/UserFieldsMD?$filter=TableName eq 'OCRD'&$select=Name,Description,Type,ValidValuesMD&$skip=20&$top=100`, { headers });
    if (udfRes.status === 200 && udfRes.data.value) {
        udfRes.data.value.forEach(udf => {
            const vals = udf.ValidValuesMD?.length > 0 ? ` [${udf.ValidValuesMD.map(v => `${v.Value}="${v.Description}"`).join(', ')}]` : '';
            console.log(`  U_${udf.Name} (${udf.Description}) - ${udf.Type}${vals}`);
        });
    }
    
    // Payment terms with days
    console.log('\n--- Payment Terms (with days) ---');
    const ptRes = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName,NumberOfAdditionalDays&$filter=PaymentTermsGroupName eq '60 días' or PaymentTermsGroupName eq '75 días' or PaymentTermsGroupName eq '90 días' or PaymentTermsGroupName eq 'Contado' or PaymentTermsGroupName eq '30 días'`, { headers });
    if (ptRes.status === 200 && ptRes.data.value) {
        ptRes.data.value.forEach(pt => console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName} (${pt.NumberOfAdditionalDays} days)`));
    } else {
        // Try simpler query
        const ptRes2 = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName&$skip=20&$top=50`, { headers });
        if (ptRes2.status === 200 && ptRes2.data.value) {
            ptRes2.data.value.forEach(pt => console.log(`  ${pt.GroupNumber}: ${pt.PaymentTermsGroupName}`));
        }
    }

    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
    console.log('\nDone.');
}

main().catch(console.error);
