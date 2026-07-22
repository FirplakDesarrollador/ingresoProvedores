const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function sapRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = https.request({
            hostname: parsedUrl.hostname, port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search, method: options.method || 'GET',
            headers: options.headers || {}, agent,
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function main() {
    const baseUrl = 'https://200.7.96.194:50000/b1s/v1';
    const login = await sapRequest(`${baseUrl}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CompanyDB: 'Firplak_SA', Password: '2023Fir#.*', UserName: 'manager' })
    });
    const headers = { 'Cookie': `B1SESSION=${login.data.SessionId}` };
    
    // Get valid accounts from real suppliers
    const bpRes = await sapRequest(`${baseUrl}/BusinessPartners?$filter=CardType eq 'cSupplier'&$select=CardCode,CardName,DebPayAcct,GroupCode&$top=5`, { headers });
    console.log("Real Suppliers DebPayAcct:", JSON.stringify(bpRes.data.value, null, 2));
}
main();
