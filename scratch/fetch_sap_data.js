const https = require('https');
const fs = require('fs');
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

    async function fetchAll(endpoint) {
        let results = [];
        let nextLink = endpoint;
        while (nextLink) {
            console.log(`Fetching ${nextLink}...`);
            // Ensure nextLink has the correct base
            const urlPath = nextLink.startsWith('b1s/v1/') ? nextLink : `b1s/v1/${nextLink}`;
            const res = await sapRequest(baseUrl.replace('/b1s/v1', '') + '/' + urlPath.replace(/^\//, ''), { headers });
            if (res.status !== 200) {
                console.error('Error fetching', nextLink, res.status, res.data);
                break;
            }
            if (res.data.value) results = results.concat(res.data.value);
            nextLink = res.data['odata.nextLink'] || res.data['@odata.nextLink'];
            if (!nextLink) break;
        }
        return results;
    }

    console.log('Fetching Actividades...');
    const actividades = await fetchAll('b1s/v1/U_HBT_ACTIVIDADECO');
    fs.writeFileSync('src/lib/actividades_sap.json', JSON.stringify(actividades, null, 2));
    console.log(`Saved ${actividades.length} actividades.`);
    
    console.log('Fetching Municipios...');
    const municipios = await fetchAll('b1s/v1/U_HBT_MUNICIPIO');
    fs.writeFileSync('src/lib/municipios_sap.json', JSON.stringify(municipios, null, 2));
    console.log(`Saved ${municipios.length} municipios.`);

    await sapRequest(`${baseUrl}/Logout`, { method: 'POST', headers });
    console.log('Done.');
}
main().catch(console.error);
