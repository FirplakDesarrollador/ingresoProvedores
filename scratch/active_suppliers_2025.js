const https = require('https');

const SAP_CONFIG = {
  LoginUrl: 'https://200.7.96.194:50000/b1s/v1/Login',
  InvoicesUrl: 'https://200.7.96.194:50000/b1s/v1/PurchaseInvoices',
  CompanyDB: 'Firplak_SA',
  Password: '2023Fir#.*',
  UserName: 'manager'
};

const TODAY = new Date().toISOString().split('T')[0]; // e.g. 2026-04-28
const FROM  = '2025-01-01';

const agent = new https.Agent({ rejectUnauthorized: false });

function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, agent }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const r = { statusCode: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : null };
          res.statusCode < 300 ? resolve(r) : reject(new Error(`${res.statusCode}: ${JSON.stringify(r.data).substring(0,200)}`));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login() {
  const res = await request(SAP_CONFIG.LoginUrl,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { CompanyDB: SAP_CONFIG.CompanyDB, Password: SAP_CONFIG.Password, UserName: SAP_CONFIG.UserName }
  );
  return res.headers['set-cookie'];
}

async function getTotal(cookies) {
  const filter = `DocDate ge '${FROM}' and DocDate le '${TODAY}'`;
  const url = `${SAP_CONFIG.InvoicesUrl}?$filter=${encodeURIComponent(filter)}&$select=DocEntry&$top=1&$inlinecount=allpages`;
  const res = await request(url, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
  return parseInt(res.data['odata.count'] || '0');
}

async function getPage(cookies, skip) {
  const filter = `DocDate ge '${FROM}' and DocDate le '${TODAY}'`;
  const url = `${SAP_CONFIG.InvoicesUrl}?$filter=${encodeURIComponent(filter)}&$select=CardCode,CardName&$orderby=DocEntry asc&$skip=${skip}`;
  const res = await request(url, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
  return res.data.value || [];
}

async function main() {
  console.log(`\n🔐 Conectando a SAP...`);
  const cookies = await login();
  console.log(`✅ Login OK\n`);
  console.log(`📅 Período: ${FROM} → ${TODAY}`);

  const total = await getTotal(cookies);
  console.log(`📋 Total facturas en ese período: ${total}`);
  console.log(`🔄 Leyendo todos los registros...\n`);

  const suppliers = new Map(); // CardCode -> { name, count }
  let skip = 0;
  let fetched = 0;

  while (fetched < total) {
    const batch = await getPage(cookies, skip);
    if (!batch.length) break;

    for (const inv of batch) {
      if (!suppliers.has(inv.CardCode)) {
        suppliers.set(inv.CardCode, { name: inv.CardName, count: 0 });
      }
      suppliers.get(inv.CardCode).count++;
    }

    fetched += batch.length;
    skip    += batch.length;
    process.stdout.write(`  Procesando: ${fetched}/${total} facturas | Únicos: ${suppliers.size}   \r`);
    if (batch.length < 20) break;
  }

  const sorted = [...suppliers.entries()].sort((a, b) => b[1].count - a[1].count);

  console.log(`\n\n${'═'.repeat(65)}`);
  console.log(`  PROVEEDORES ACTIVOS  (${FROM} → ${TODAY})`);
  console.log(`${'═'.repeat(65)}`);
  console.log(`  Total facturas procesadas : ${fetched}`);
  console.log(`  PROVEEDORES ÚNICOS        : ${suppliers.size}`);
  console.log(`${'═'.repeat(65)}\n`);

  console.log('Código'.padEnd(22) + 'Proveedor'.padEnd(42) + '#Facturas');
  console.log('─'.repeat(72));
  sorted.forEach(([code, d], i) => {
    console.log((i+1 + '.').padEnd(5) + code.padEnd(22) + d.name.substring(0,40).padEnd(42) + d.count);
  });

  console.log(`\n✅ TOTAL PROVEEDORES ACTIVOS SIN REPETIR: ${suppliers.size}`);
}

main().catch(e => console.error('❌', e.message));
