import https from 'https';
import fs from 'fs';

const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function sapRequest(url, options) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            agent: insecureAgent,
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); }
                catch { parsed = data; }
                resolve({ status: res.statusCode || 500, data: parsed, headers: res.headers });
            });
        });

        req.on('error', (err) => reject(err));
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function checkSAP() {
    const loginUrl = "https://200.7.96.194:50000/b1s/v1/Login";
    const baseUrl = loginUrl.replace('/Login', '');

    const loginRes = await sapRequest(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            CompanyDB: "Firplak_SA",
            Password: "2023Fir#.*",
            UserName: "manager",
        }),
    });

    const sessionId = loginRes.data.SessionId;
    const authHeaders = { 
        'Cookie': `B1SESSION=${sessionId}`, 
        'Content-Type': 'application/json' 
    };

    const cardCode = 'AC283642634-01'; // Second Employee ID from screenshot

    const checkUrl = `${baseUrl}/BusinessPartners?$filter=CardCode eq '${cardCode}'`;
    const checkRes = await sapRequest(checkUrl, { headers: authHeaders });

    console.log(JSON.stringify(checkRes.data, null, 2));
}

checkSAP();
