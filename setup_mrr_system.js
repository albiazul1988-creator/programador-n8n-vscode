const https = require('https');

const N8N_HOST = 'n8n.cruzn8n.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';

const WF_IDS = {
  prospeccion: 'Pyi6ik5b0gI7RFdj',
  propuestas:  'cfjdtS7tMJLLISx2',
  followup:    'tzx1kHP2UFVcjhTA',
  reporte:     'w7VsqTe4KxCZdYii',
  onboarding:  's7jp68fMhdhoU0AK',
  maestro:     'ORn1RH9iJYADXis3',
};

const PLACEHOLDER = 'REEMPLAZAR_CON_ID_SHEET_CLIENTES_SERVICIO';
const HELPER_WEBHOOK_PATH = 'mrr-setup-create-sheet-tmp';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: N8N_HOST, port: 443, path, method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Llamar al webhook de n8n (no usa la API key, es acceso público)
function callWebhook(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: N8N_HOST, port: 443,
      path: `/webhook/${path}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': 2 },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write('{}');
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Workflow helper con webhook trigger → crea sheet → responde con el ID
const HELPER_WF = {
  name: '_MRR_SETUP_HELPER',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: HELPER_WEBHOOK_PATH,
        responseMode: 'lastNode',
        options: {},
      },
      id: 'n1', name: 'Webhook', type: 'n8n-nodes-base.webhook',
      typeVersion: 2, position: [240, 300],
      webhookId: HELPER_WEBHOOK_PATH,
    },
    {
      parameters: {
        resource: 'spreadsheet',
        operation: 'create',
        title: 'CLIENTES_SERVICIO - LeadPilot',
        options: {},
      },
      id: 'n2', name: 'Crear Spreadsheet',
      type: 'n8n-nodes-base.googleSheets',
      typeVersion: 4.5, position: [460, 300],
      credentials: { googleSheetsOAuth2Api: { id: 'cslbWyeFCpb8UwYb', name: 'Google Sheets account' } },
    },
    {
      parameters: {
        operation: 'append',
        documentId: { __rl: true, value: '={{ $json.spreadsheetId }}', mode: 'id' },
        sheetName: { __rl: true, value: 'Clientes', mode: 'name' },
        columns: {
          mappingMode: 'defineBelow',
          value: {
            Nombre_Cliente: 'Nombre_Cliente', Email_Cliente: 'Email_Cliente',
            Plan: 'Plan', Ciudad: 'Ciudad', Categorias: 'Categorias',
            Nombre_Remitente: 'Nombre_Remitente', Estado: 'Estado',
            Fecha_Inicio: 'Fecha_Inicio', Limite_Semanal: 'Limite_Semanal', Sheet_ID: 'Sheet_ID',
          },
        },
        options: {},
      },
      id: 'n3', name: 'Añadir Cabeceras',
      type: 'n8n-nodes-base.googleSheets',
      typeVersion: 4.5, position: [680, 300],
      credentials: { googleSheetsOAuth2Api: { id: 'cslbWyeFCpb8UwYb', name: 'Google Sheets account' } },
    },
    {
      parameters: {
        jsCode: "const id = $('Crear Spreadsheet').first().json.spreadsheetId;\nreturn [{ json: { spreadsheetId: id, url: 'https://docs.google.com/spreadsheets/d/' + id } }];",
        mode: 'runOnceForAllItems',
      },
      id: 'n4', name: 'Responder ID',
      type: 'n8n-nodes-base.code',
      typeVersion: 2, position: [900, 300],
    },
  ],
  connections: {
    'Webhook': { main: [[{ node: 'Crear Spreadsheet', type: 'main', index: 0 }]] },
    'Crear Spreadsheet': { main: [[{ node: 'Añadir Cabeceras', type: 'main', index: 0 }]] },
    'Añadir Cabeceras': { main: [[{ node: 'Responder ID', type: 'main', index: 0 }]] },
  },
  settings: { executionOrder: 'v1' },
};

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║    MRR-SYSTEM SETUP — Cruz Digital       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ── PASO 1: Crear Google Sheet ────────────────────────────────
  console.log('PASO 1: Crear Google Sheet CLIENTES_SERVICIO...');

  // Crear y activar helper
  const created = await request('POST', '/api/v1/workflows', HELPER_WF);
  if (created.status !== 200 && created.status !== 201) {
    console.error('✗ Error creando helper:', JSON.stringify(created.body).substring(0, 200));
    process.exit(1);
  }
  const helperId = created.body.id;

  // Activarlo para que el webhook esté disponible
  const activated = await request('POST', `/api/v1/workflows/${helperId}/activate`, null);
  if (activated.status !== 200 && activated.status !== 201) {
    console.error('✗ Error activando helper:', JSON.stringify(activated.body).substring(0, 200));
    await request('DELETE', `/api/v1/workflows/${helperId}`, null);
    process.exit(1);
  }
  console.log(`  Helper activado (ID: ${helperId}), esperando webhook...`);
  await sleep(2000); // Dar tiempo a que n8n registre el webhook

  // Llamar al webhook
  const webhookRes = await callWebhook(HELPER_WEBHOOK_PATH);
  let sheetId = webhookRes.body?.spreadsheetId || webhookRes.body?.[0]?.json?.spreadsheetId;

  // Borrar helper
  await request('DELETE', `/api/v1/workflows/${helperId}`, null);

  if (!sheetId) {
    console.error('\n✗ No se obtuvo el spreadsheetId.');
    console.error('  Respuesta recibida:', JSON.stringify(webhookRes.body).substring(0, 300));
    console.error('\n  Posible causa: la credencial OAuth2 de Google Sheets necesita reautorizarse.');
    console.error('  → Ve a n8n → Credentials → Google Sheets account → Reconnect');
    process.exit(1);
  }

  console.log(`  ✓ Sheet creado: ${sheetId}`);
  console.log(`  URL: https://docs.google.com/spreadsheets/d/${sheetId}\n`);

  // ── PASO 2: Actualizar los 4 workflows ────────────────────────
  console.log('PASO 2: Inyectar Sheet ID en WF-03, WF-04, WF-05, WF-06...');
  const toUpdate = [
    { name: 'WF-03 Follow-up',  id: WF_IDS.followup   },
    { name: 'WF-04 Reporte',    id: WF_IDS.reporte    },
    { name: 'WF-05 Onboarding', id: WF_IDS.onboarding },
    { name: 'WF-06 Maestro',    id: WF_IDS.maestro    },
  ];

  for (const wf of toUpdate) {
    process.stdout.write(`  ${wf.name} ... `);
    const get = await request('GET', `/api/v1/workflows/${wf.id}`, null);
    if (get.status !== 200) { console.log(`✗ GET ${get.status}`); continue; }
    const updated = JSON.parse(JSON.stringify(get.body).replaceAll(PLACEHOLDER, sheetId));
    delete updated.id;
    const put = await request('PUT', `/api/v1/workflows/${wf.id}`, updated);
    console.log(put.status === 200 || put.status === 201 ? '✓' : `✗ ${put.status}: ${JSON.stringify(put.body).substring(0,80)}`);
    await sleep(300);
  }
  console.log('');

  // ── PASO 3: Activar WF-01 y WF-02 ────────────────────────────
  console.log('PASO 3: Activar WF-01 y WF-02 (webhooks)...');
  const toActivate = [
    { name: 'WF-01 Prospección', id: WF_IDS.prospeccion },
    { name: 'WF-02 Propuestas',  id: WF_IDS.propuestas  },
  ];

  for (const wf of toActivate) {
    process.stdout.write(`  ${wf.name} ... `);
    const get = await request('GET', `/api/v1/workflows/${wf.id}`, null);
    if (get.status !== 200) { console.log(`✗ GET ${get.status}`); continue; }
    const put = await request('POST', `/api/v1/workflows/${wf.id}/activate`, null);
    console.log(put.status === 200 || put.status === 201 ? '✓ activo' : `✗ ${put.status}`);
    await sleep(300);
  }
  console.log('');

  // ── RESUMEN FINAL ─────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║            SETUP COMPLETADO                      ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Sheet ID: ${sheetId}`);
  console.log(`║  URL: docs.google.com/spreadsheets/d/`);
  console.log(`║       ${sheetId}`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  WF-01 Prospección  → ACTIVO  (POST /mrr-prospeccion) ║');
  console.log('║  WF-02 Propuestas   → ACTIVO  (POST /mrr-propuestas)  ║');
  console.log('║  WF-03 Follow-up    → 9AM diario                      ║');
  console.log('║  WF-04 Reporte      → viernes 17h                     ║');
  console.log('║  WF-05 Onboarding   → webhook /mrr-onboarding         ║');
  console.log('║  WF-06 Maestro      → lunes 8AM                       ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  LISTO. Añade tu primer cliente via onboarding   ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

main().catch(e => { console.error('Error fatal:', e.message); process.exit(1); });
