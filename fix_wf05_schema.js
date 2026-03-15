const https = require('https');
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';

function req(method, path, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const o = {
      hostname: 'n8n.cruzn8n.com', port: 443, path, method,
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
      rejectUnauthorized: false
    };
    const r = https.request(o, rr => {
      let d = ''; rr.on('data', c => d += c);
      rr.on('end', () => { try { res({ s: rr.statusCode, b: JSON.parse(d) }); } catch { res({ s: rr.statusCode, b: d }); } });
    });
    r.on('error', rej); if (data) r.write(data); r.end();
  });
}

// Schema que normalmente genera la UI de n8n al configurar el nodo Google Sheets
const SCHEMA = [
  { id: 'Nombre_Cliente',   displayName: 'Nombre_Cliente',   required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Email_Cliente',    displayName: 'Email_Cliente',    required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Plan',             displayName: 'Plan',             required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Ciudad',           displayName: 'Ciudad',           required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Categorias',       displayName: 'Categorias',       required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Nombre_Remitente', displayName: 'Nombre_Remitente', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Estado',           displayName: 'Estado',           required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Fecha_Inicio',     displayName: 'Fecha_Inicio',     required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Limite_Semanal',   displayName: 'Limite_Semanal',   required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
  { id: 'Sheet_ID',         displayName: 'Sheet_ID',         required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
];

const nodes = [
  {
    parameters: { httpMethod: 'POST', path: 'mrr-onboarding', responseMode: 'lastNode', options: {} },
    id: 'node_webhook', name: 'Webhook Onboarding',
    type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [240, 300],
    webhookId: 'mrr-onboarding-v1'
  },
  {
    parameters: {
      assignments: { assignments: [
        { id: 'v1', name: 'cliente_nombre',    value: '={{ $json.body.cliente_nombre }}', type: 'string' },
        { id: 'v2', name: 'email_cliente',     value: '={{ $json.body.email_cliente }}', type: 'string' },
        { id: 'v3', name: 'plan',              value: '={{ $json.body.plan || "Starter" }}', type: 'string' },
        { id: 'v4', name: 'ciudad',            value: '={{ $json.body.ciudad }}', type: 'string' },
        { id: 'v5', name: 'categorias',        value: '={{ $json.body.categorias }}', type: 'string' },
        { id: 'v6', name: 'nombre_remitente',  value: '={{ $json.body.nombre_remitente || "Juan" }}', type: 'string' },
        { id: 'v7', name: 'sheet_id_maestro',  value: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU', type: 'string' },
        { id: 'v8', name: 'limite_semanal',    value: '={{ $json.body.plan === "Pro" ? 200 : ($json.body.plan === "Agency" ? 500 : 50) }}', type: 'number' },
        { id: 'v9', name: 'fecha_inicio',      value: '={{ $now.format("dd/MM/yyyy") }}', type: 'string' },
      ]}
    },
    id: 'node_vars', name: 'Extraer Variables',
    type: 'n8n-nodes-base.set', typeVersion: 3.4, position: [460, 300]
  },
  {
    parameters: {
      assignments: { assignments: [
        { id: 'g1', name: 'html_bienvenida',   value: '={{ "<h2>Bienvenido a LeadPilot, " + $json.cliente_nombre + "!</h2><p>Tu sistema de captacion automatica ya esta en marcha.</p><p><b>Plan:</b> " + $json.plan + " | <b>Ciudad:</b> " + $json.ciudad + "</p><p>Cada lunes el sistema buscara nuevos negocios en " + $json.categorias + " y les enviara propuestas por WhatsApp.</p><p>Cada viernes recibiras tu reporte semanal.</p><p>Un saludo,<br/><b>" + $json.nombre_remitente + "</b> - Cruz Digital</p>" }}', type: 'string' },
        { id: 'g2', name: 'cliente_nombre',    value: '={{ $json.cliente_nombre }}', type: 'string' },
        { id: 'g3', name: 'email_cliente',     value: '={{ $json.email_cliente }}', type: 'string' },
        { id: 'g4', name: 'plan',              value: '={{ $json.plan }}', type: 'string' },
        { id: 'g5', name: 'ciudad',            value: '={{ $json.ciudad }}', type: 'string' },
        { id: 'g6', name: 'categorias',        value: '={{ $json.categorias }}', type: 'string' },
        { id: 'g7', name: 'nombre_remitente',  value: '={{ $json.nombre_remitente }}', type: 'string' },
        { id: 'g8', name: 'sheet_id_maestro',  value: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU', type: 'string' },
        { id: 'g9', name: 'sheet_id_cliente',  value: '={{ $json.sheet_id_cliente || "" }}', type: 'string' },
        { id: 'g10', name: 'fecha_inicio',     value: '={{ new Date().toISOString().split("T")[0] }}', type: 'string' },
      ]},
      options: {}
    },
    type: 'n8n-nodes-base.set', typeVersion: 3.4, position: [680, 300],
    id: 'node-gpt-bienvenida', name: 'GPT Genera Email Bienvenida'
  },
  {
    parameters: {
      sendTo: '={{ $json.email_cliente }}',
      subject: 'Bienvenido a LeadPilot - Tu sistema de captacion automatica ya esta en marcha',
      emailType: 'html',
      message: '={{ $json.html_bienvenida }}',
      options: {}
    },
    type: 'n8n-nodes-base.gmail', typeVersion: 2.1, position: [900, 160],
    id: 'node-gmail-bienvenida', name: 'Enviar Email Bienvenida',
    credentials: { gmailOAuth2: { id: '59B2ehjmeBecNvB3', name: 'Gmail account' } }
  },
  {
    parameters: {
      operation: 'append',
      documentId: { __rl: true, value: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU', mode: 'id' },
      sheetName: { __rl: true, value: 'Clientes', mode: 'name' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          Nombre_Cliente:   '={{ $json.cliente_nombre }}',
          Email_Cliente:    '={{ $json.email_cliente }}',
          Plan:             '={{ $json.plan }}',
          Ciudad:           '={{ $json.ciudad }}',
          Categorias:       '={{ $json.categorias }}',
          Nombre_Remitente: '={{ $json.nombre_remitente }}',
          Estado:           'activo',
          Fecha_Inicio:     '={{ $json.fecha_inicio }}',
          Limite_Semanal:   '={{ $json.limite_semanal || 50 }}',
          Sheet_ID:         '={{ $json.sheet_id_cliente }}',
        },
        schema: SCHEMA,
        mappingMode: 'defineBelow'
      },
      options: {}
    },
    id: 'node-guardar-cliente', name: 'Registrar Cliente en Sheet Maestro',
    type: 'n8n-nodes-base.googleSheets', typeVersion: 4.5, position: [900, 440],
    credentials: { googleSheetsOAuth2Api: { id: 'cslbWyeFCpb8UwYb', name: 'Google Sheets account' } }
  },
  {
    parameters: {
      jsCode: `const v = $input.first().json;
return [{ json: { status: 'onboarding_completado', cliente: v.cliente_nombre, email: v.email_cliente } }];`,
      mode: 'runOnceForAllItems'
    },
    type: 'n8n-nodes-base.code', typeVersion: 2, position: [1120, 300],
    id: 'node-log-final', name: 'Log Onboarding Completado'
  }
];

const connections = {
  'Webhook Onboarding': { main: [[{ node: 'Extraer Variables', type: 'main', index: 0 }]] },
  'Extraer Variables': { main: [[{ node: 'GPT Genera Email Bienvenida', type: 'main', index: 0 }]] },
  'GPT Genera Email Bienvenida': { main: [[
    { node: 'Enviar Email Bienvenida', type: 'main', index: 0 },
    { node: 'Registrar Cliente en Sheet Maestro', type: 'main', index: 0 }
  ]] },
  'Enviar Email Bienvenida': { main: [[{ node: 'Log Onboarding Completado', type: 'main', index: 0 }]] },
  'Registrar Cliente en Sheet Maestro': { main: [[{ node: 'Log Onboarding Completado', type: 'main', index: 0 }]] }
};

async function main() {
  const put = await req('PUT', '/api/v1/workflows/s7jp68fMhdhoU0AK', {
    name: 'MRR-05 Onboarding Nuevo Cliente',
    nodes, connections,
    settings: { executionOrder: 'v1' }
  });
  console.log('PUT:', put.s);
  if (put.s !== 200) {
    console.log('Error:', JSON.stringify(put.b).substring(0, 500));
    return;
  }
  const act = await req('POST', '/api/v1/workflows/s7jp68fMhdhoU0AK/activate', null);
  console.log('Activate:', act.s);
  console.log('Workflow actualizado con schema. Probando...');
}

main().catch(e => console.error(e.message));
