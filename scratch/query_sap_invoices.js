const https = require('https');

const SAP_CONFIG = {
  LoginUrl: 'https://200.7.96.194:50000/b1s/v1/Login',
  InvoicesUrl: 'https://200.7.96.194:50000/b1s/v1/PurchaseInvoices',
  CompanyDB: 'Firplak_SA',
  Password: '2023Fir#.*',
  UserName: 'manager'
};

const agent = new https.Agent({ rejectUnauthorized: false });

function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, agent }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = { statusCode: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : null };
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(result);
          else reject(new Error(`Status ${res.statusCode}: ${JSON.stringify(result.data).substring(0, 300)}`));
        } catch(e) { reject(new Error(`Parse error: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login() {
  const res = await request(SAP_CONFIG.LoginUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, { CompanyDB: SAP_CONFIG.CompanyDB, Password: SAP_CONFIG.Password, UserName: SAP_CONFIG.UserName });
  return res.headers['set-cookie'];
}

async function getPage(cookies, skip) {
  // Use $select to minimize payload
  // Use $orderby to ensure stable pagination
  const filter = `DocDate le '2025-12-31'`;
  const select = `CardCode,CardName`;
  const url = `${SAP_CONFIG.InvoicesUrl}?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=DocEntry asc&$skip=${skip}`;
  const res = await request(url, {
    method: 'GET',
    headers: { 'Cookie': cookies.join('; ') }
  });
  return res.data.value || [];
}

async function getTotal(cookies) {
  const url = `${SAP_CONFIG.InvoicesUrl}?$filter=${encodeURIComponent("DocDate le '2025-12-31'")}&$select=DocEntry&$top=1&$inlinecount=allpages`;
  const res = await request(url, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
  return parseInt(res.data['odata.count'] || '0');
}

async function main() {
  console.log('🔐 Logging into SAP (Firplak_SA)...');
  const cookies = await login();
  console.log('✅ Login successful.\n');

  const totalInvoices = await getTotal(cookies);
  console.log(`📋 Total facturas en SAP hasta 2025: ${totalInvoices}`);
  console.log(`🔄 Paginando de a 20 registros (el límite del servidor)...\n`);

  const uniqueSuppliers = new Map();
  let skip = 0;
  let fetched = 0;
  let pageSize = 20; // SAP default page cap
  let errors = 0;

  while (fetched < totalInvoices) {
    try {
      const batch = await getPage(cookies, skip);
      if (batch.length === 0) break;

      for (const inv of batch) {
        if (!uniqueSuppliers.has(inv.CardCode)) {
          uniqueSuppliers.set(inv.CardCode, { name: inv.CardName, count: 0 });
        }
        uniqueSuppliers.get(inv.CardCode).count++;
      }

      fetched += batch.length;
      skip += batch.length;

      // Show progress every 500
      if (fetched % 500 === 0 || fetched >= totalInvoices) {
        process.stdout.write(`  Procesados: ${fetched}/${totalInvoices} facturas | Proveedores únicos hasta ahora: ${uniqueSuppliers.size}   \r`);
      }

      if (batch.length < pageSize) break; // last page

    } catch(err) {
      errors++;
      console.error(`\n⚠️  Error en skip=${skip}: ${err.message}`);
      if (errors > 5) { console.error('Demasiados errores, abortando.'); break; }
      skip += pageSize; // skip this page and continue
    }
  }

  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`RESULTADO FINAL — Proveedores con Facturas hasta 2025 (Firplak_SA)`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Total facturas en SAP (conteo)  : ${totalInvoices}`);
  console.log(`Total facturas procesadas       : ${fetched}`);
  console.log(`PROVEEDORES ÚNICOS              : ${uniqueSuppliers.size}`);
  console.log(`${'='.repeat(70)}\n`);

  const sorted = [...uniqueSuppliers.entries()].sort((a, b) => b[1].count - a[1].count);

  console.log('TOP 30 proveedores por número de facturas:');
  console.log('─'.repeat(75));
  console.log('Código'.padEnd(22) + 'Proveedor'.padEnd(44) + 'Facturas');
  console.log('─'.repeat(75));
  sorted.slice(0, 30).forEach(([code, data]) => {
    console.log(code.padEnd(22) + data.name.substring(0, 42).padEnd(44) + data.count);
  });

  if (sorted.length > 30) {
    console.log(`\n... y ${sorted.length - 30} proveedores más con menor actividad.`);
  }

  console.log(`\n✅ TOTAL PROVEEDORES ÚNICOS CON FACTURAS HASTA 2025: ${uniqueSuppliers.size}`);
}

main().catch(err => console.error('❌ Error fatal:', err.message));
