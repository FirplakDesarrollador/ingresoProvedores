const https = require('https');

// SAP Config
const SAP_CONFIG = {
  LoginUrl:    'https://200.7.96.194:50000/b1s/v1/Login',
  InvoicesUrl: 'https://200.7.96.194:50000/b1s/v1/PurchaseInvoices',
  BusinessPartnersUrl: 'https://200.7.96.194:50000/b1s/v1/BusinessPartners',
  CompanyDB: 'Firplak_SA',
  Password:  '2023Fir#.*',
  UserName:  'manager'
};

// Supabase Config
const SUPABASE_URL  = 'https://zohdtksgxhbheaftgmsi.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGR0a3NneGhiaGVhZnRnbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjExNTEsImV4cCI6MjAzODUzNzE1MX0.Euu6FTh11mbh4lUmhKFMTFYZ9hWgZ-RzECcUYKGRYQE';

const TODAY = new Date().toISOString().split('T')[0];
const FROM  = '2025-01-01';

const agent = new https.Agent({ rejectUnauthorized: false });

// ── helpers ──────────────────────────────────────────────────────────────────

function sapRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, agent }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const r = { statusCode: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : null };
          res.statusCode < 300 ? resolve(r) : reject(new Error(`SAP ${res.statusCode}: ${JSON.stringify(r.data).substring(0, 300)}`));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function supabaseRequest(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode < 300) resolve({ ok: true, status: res.statusCode });
        else reject(new Error(`Supabase ${res.statusCode}: ${data.substring(0, 300)}`));
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ── Step 1: login to SAP ──────────────────────────────────────────────────────

async function sapLogin() {
  const res = await sapRequest(SAP_CONFIG.LoginUrl,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { CompanyDB: SAP_CONFIG.CompanyDB, Password: SAP_CONFIG.Password, UserName: SAP_CONFIG.UserName }
  );
  return res.headers['set-cookie'];
}

// ── Step 2: get all unique CardCodes from invoices Jan2025→today ──────────────

async function getActiveCardCodes(cookies) {
  const filter = `DocDate ge '${FROM}' and DocDate le '${TODAY}'`;
  const url = `${SAP_CONFIG.InvoicesUrl}?$filter=${encodeURIComponent(filter)}&$select=CardCode,CardName&$orderby=DocEntry asc`;
  
  const cardCodes = new Map();
  let skip = 0;
  let total = null;

  // get total count first
  const countRes = await sapRequest(`${url}&$top=1&$inlinecount=allpages`, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
  total = parseInt(countRes.data['odata.count'] || '0');
  console.log(`  Total facturas en el período: ${total}`);

  while (cardCodes.size === 0 || skip < total) {
    const batch = await sapRequest(`${url}&$skip=${skip}`, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
    const rows = batch.data.value || [];
    if (!rows.length) break;
    for (const r of rows) cardCodes.set(r.CardCode, r.CardName);
    skip += rows.length;
    process.stdout.write(`  Procesando facturas: ${skip}/${total} | Proveedores únicos: ${cardCodes.size}   \r`);
    if (rows.length < 20) break;
  }
  console.log(`\n  ✅ ${cardCodes.size} proveedores únicos extraídos de facturas.`);
  return cardCodes;
}

// ── Step 3: get BusinessPartner details from SAP for each CardCode ────────────

async function getBPDetails(cookies, cardCode) {
  try {
    const url = `${SAP_CONFIG.BusinessPartnersUrl}('${encodeURIComponent(cardCode)}')?$select=CardCode,CardName,FederalTaxID,EmailAddress,Phone1,City,Country,Valid`;
    const res = await sapRequest(url, { method: 'GET', headers: { 'Cookie': cookies.join('; ') } });
    return res.data;
  } catch {
    return null; // some may 404
  }
}

// ── Step 4: upsert batch into Supabase SAP_Provedores ────────────────────────

async function upsertToSupabase(rows) {
  await supabaseRequest('/rest/v1/SAP_Provedores', 'POST', rows);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔐 Conectando a SAP...');
  const cookies = await sapLogin();
  console.log('✅ Login OK\n');

  console.log(`📅 Extrayendo proveedores activos (${FROM} → ${TODAY})...`);
  const activeCards = await getActiveCardCodes(cookies);

  console.log(`\n🔍 Obteniendo detalles de cada proveedor desde SAP BusinessPartners...`);
  const cardList = [...activeCards.entries()];
  const detailedRows = [];
  let done = 0;

  for (const [cardCode, cardName] of cardList) {
    const bp = await getBPDetails(cookies, cardCode);
    detailedRows.push({
      CardCode:     cardCode,
      CardName:     bp?.CardName     || cardName,
      FederalTaxID: bp?.FederalTaxID || null,
      EmailAddress: bp?.EmailAddress || null,
      Phone1:       bp?.Phone1       || null,
      City:         bp?.City         || null,
      Country:      bp?.Country      || null,
      Valid:        bp?.Valid === 'tYES' || bp?.Valid === true || bp?.Valid == null ? true : false,
      updated_at:   new Date().toISOString()
    });
    done++;
    process.stdout.write(`  Detalles: ${done}/${cardList.length}   \r`);
  }
  console.log(`\n  ✅ Detalles obtenidos.\n`);

  console.log('💾 Insertando / actualizando en Supabase (SAP_Provedores)...');
  const batchSize = 50;
  for (let i = 0; i < detailedRows.length; i += batchSize) {
    const batch = detailedRows.slice(i, i + batchSize);
    await upsertToSupabase(batch);
    process.stdout.write(`  Upserted: ${Math.min(i + batchSize, detailedRows.length)}/${detailedRows.length}   \r`);
  }

  console.log(`\n\n${'═'.repeat(60)}`);
  console.log(`  ✅ LISTO — ${detailedRows.length} proveedores activos sincronizados`);
  console.log(`     Tabla: SAP_Provedores (proyecto: Visitantes y proveedores)`);
  console.log(`${'═'.repeat(60)}`);
}

main().catch(e => console.error('❌ Error fatal:', e.message));
