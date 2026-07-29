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

    // Query User tables metadata to find Municipality and Economic Activity tables
    console.log('--- User Tables ---');
    const udtRes = await sapRequest(`${baseUrl}/UserTablesMD?$select=TableName,TableDescription&$filter=startswith(TableName, 'HBT_MUN') or startswith(TableName, 'HBT_ACT') or startswith(TableName, 'OK1_AC')`, { headers });
    if (udtRes.status === 200 && udtRes.data.value) {
        udtRes.data.value.forEach(t => console.log(t));
    } else {
        console.log(udtRes.data);
    }
    
    // Also check standard Industries just in case
    console.log('\n--- Industries (CIIU) ---');
    const indRes = await sapRequest(`${baseUrl}/Industries?$select=IndustryCode,IndustryName,IndustryDescription`, { headers });
    if (indRes.status === 200 && indRes.data.value) {
        indRes.data.value.slice(0, 5).forEach(i => console.log(i));
    }
    
    // UDF valid values for OCRD fields
    console.log('\n--- UDF Valid Values for U_HBT_MunMed and U_HBT_ActEco ---');
    const udfRes = await sapRequest(`${baseUrl}/UserFieldsMD?$filter=TableName eq 'OCRD' and (Name eq 'HBT_MunMed' or Name eq 'HBT_ActEco')`, { headers });
    if (udfRes.status === 200 && udfRes.data.value) {
        udfRes.data.value.forEach(udf => {
            console.log(`U_${udf.Name} - ValidValuesMD length: ${udf.ValidValuesMD?.length || 0}`);
            if (udf.ValidValuesMD?.length > 0) {
                udf.ValidValuesMD.slice(0, 3).forEach(v => console.log(`  ${v.Value}: ${v.Description}`));
            } else if (udf.LinkedTable) {
                console.log(`  LinkedTable: ${udf.LinkedTable}`);
            }
        });
    }

    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
    console.log('\nDone.');
}
main().catch(console.error);
