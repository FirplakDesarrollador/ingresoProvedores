const https = require('https');

const baseUrl = "https://200.7.96.194:50000/b1s/v1";
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
                resolve({ status: res.statusCode || 500, data: parsed });
            });
        });

        req.on('error', (err) => reject(err));
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function run() {
    const loginRes = await sapRequest(baseUrl + "/Login", {
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

    const res = await sapRequest(baseUrl + "/BusinessPartnerGroups", { headers: authHeaders });
    if (res.data && res.data.value) {
        console.log("Groups:");
        res.data.value.forEach(g => {
            console.log(`Code: ${g.Code}, Name: ${g.Name}, Type: ${g.Type}`);
        });
    } else {
        console.log(res);
    }
}

run();
