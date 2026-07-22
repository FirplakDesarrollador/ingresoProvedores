// Script to query SAP Service Layer for UDF field names on BusinessPartners
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
    
    // 1. Login
    console.log('Logging in to SAP...');
    const loginRes = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    
    if (loginRes.status !== 200) {
        console.error('Login failed:', loginRes.data);
        return;
    }
    
    const sessionId = loginRes.data.SessionId;
    const headers = { 'Cookie': `B1SESSION=${sessionId}` };
    console.log('Login OK. Session:', sessionId);
    
    // 2. Get UDFs for BusinessPartners (TableName = OCRD)
    console.log('\n--- UDFs for BusinessPartners (OCRD) ---');
    const udfRes = await sapRequest(`${baseUrl}/UserFieldsMD?$filter=TableName eq 'OCRD'&$select=Name,Description,Type,ValidValuesMD,TableName&$top=100`, { headers });
    
    if (udfRes.status === 200 && udfRes.data.value) {
        udfRes.data.value.forEach(udf => {
            const validValues = udf.ValidValuesMD && udf.ValidValuesMD.length > 0 
                ? ` [Values: ${udf.ValidValuesMD.map(v => `${v.Value}="${v.Description}"`).join(', ')}]` 
                : '';
            console.log(`  U_${udf.Name} (${udf.Description}) - Type: ${udf.Type}${validValues}`);
        });
    } else {
        console.log('Error fetching UDFs:', udfRes.data);
    }
    
    // 3. Get BP Groups
    console.log('\n--- Business Partner Groups ---');
    const grpRes = await sapRequest(`${baseUrl}/BusinessPartnerGroups?$select=Code,Name,Type`, { headers });
    if (grpRes.status === 200 && grpRes.data.value) {
        grpRes.data.value.forEach(g => console.log(`  Code: ${g.Code}, Name: ${g.Name}, Type: ${g.Type}`));
    }
    
    // 4. Get Payment Terms
    console.log('\n--- Payment Terms ---');
    const ptRes = await sapRequest(`${baseUrl}/PaymentTermsTypes?$select=GroupNumber,PaymentTermsGroupName`, { headers });
    if (ptRes.status === 200 && ptRes.data.value) {
        ptRes.data.value.forEach(pt => console.log(`  GroupNumber: ${pt.GroupNumber}, Name: ${pt.PaymentTermsGroupName}`));
    }
    
    // 5. Logout
    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
    console.log('\nDone. Logged out.');
}

main().catch(console.error);
