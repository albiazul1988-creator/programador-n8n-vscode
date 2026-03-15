const https = require('https');
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';

function req(method, path, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const o = {
      hostname: 'n8n.cruzn8n.com', port: 443, path, method,
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, rr => {
      let d = '';
      rr.on('data', c => d += c);
      rr.on('end', () => { try { res({ s: rr.statusCode, b: JSON.parse(d) }); } catch { res({ s: rr.statusCode, b: d }); } });
    });
    r.on('error', rej); if (data) r.write(data); r.end();
  });
}

// El jsonBody se convierte en expresión n8n (prefijo =) para que las variables se evalúen
// GPT recibe los valores reales del cliente, no las expresiones como texto literal
const OPENAI_BODY_EXPR = `={{ JSON.stringify({
  model: "gpt-4o-mini",
  temperature: 0.5,
  max_tokens: 800,
  messages: [
    {
      role: "system",
      content: "Eres un redactor profesional de emails de bienvenida para servicios B2B. Escribe en español de España. Tono: profesional pero cercano. El servicio se llama LeadPilot de Cruz Digital y consiste en captación automática de clientes via WhatsApp y Google Maps."
    },
    {
      role: "user",
      content: "Escribe un email HTML de bienvenida completo (con etiquetas html, head, body, estilos inline) para este nuevo cliente:\\n\\nNombre: " + $json.cliente_nombre + "\\nEmail: " + $json.email_cliente + "\\nPlan contratado: " + $json.plan + "\\nCiudad: " + $json.ciudad + "\\nSector objetivo: " + $json.categorias + "\\n\\nEl email debe:\\n1. Dar la bienvenida con su nombre real\\n2. Explicar qué recibirá (prospección semanal, propuestas WhatsApp, follow-ups, reporte viernes)\\n3. Indicar que el primer ciclo arranca el próximo lunes\\n4. Firmar como " + $json.nombre_remitente + " de Cruz Digital\\n5. Incluir email de contacto albiazul1988@gmail.com\\n\\nMUY IMPORTANTE: Usa el nombre real del cliente, NO uses placeholders ni variables."
    }
  ]
}) }}`;

async function main() {
  console.log('Actualizando nodo GPT de WF-05 con expresión dinámica...');
  const get = await req('GET', '/api/v1/workflows/s7jp68fMhdhoU0AK', null);

  const nodes = get.b.nodes.map(n => {
    if (n.name === 'GPT Genera Email Bienvenida' && n.type === 'n8n-nodes-base.httpRequest') {
      n.parameters.jsonBody = OPENAI_BODY_EXPR;
    }
    return n;
  });

  const put = await req('PUT', '/api/v1/workflows/s7jp68fMhdhoU0AK', {
    name: get.b.name, nodes, connections: get.b.connections, settings: get.b.settings || {}
  });
  console.log('WF-05 actualizado:', put.s === 200 ? '✓' : `✗ ${put.s}`);

  // Testear
  const payload = JSON.stringify({
    cliente_nombre:   'Restaurante La Taberna del Sol',
    email_cliente:    'albiazul1988@gmail.com',
    plan:             'Starter',
    ciudad:           'Madrid',
    categorias:       'restaurantes,bares',
    nombre_remitente: 'Alberto',
    sheet_id_maestro: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU',
    sheet_id_cliente: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU'
  });

  console.log('\nTesteando onboarding con nombre real (espera ~15s)...');
  const result = await new Promise(resolve => {
    const o = {
      hostname: 'n8n.cruzn8n.com', port: 443, path: '/webhook/mrr-onboarding', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, rr => {
      let d = ''; rr.on('data', c => d += c);
      rr.on('end', () => { try { resolve({ s: rr.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: rr.statusCode, b: d }); } });
    });
    r.on('error', e => resolve({ s: 0, b: e.message }));
    r.setTimeout(55000);
    r.write(payload); r.end();
  });

  console.log('\nHTTP:', result.s);
  if (result.s === 200) {
    console.log('✓ ÉXITO — revisá el email en albiazul1988@gmail.com');
  } else {
    // Ver el último error
    const list = await req('GET', '/api/v1/executions?workflowId=s7jp68fMhdhoU0AK&limit=1', null);
    const exId = list.b.data[0].id;
    const ex = await req('GET', `/api/v1/executions/${exId}?includeData=true`, null);
    const raw = JSON.stringify(ex.b);
    const ln = raw.match(/"lastNodeExecuted":"([^"]+)"/);
    const msgs = [...new Set([...raw.matchAll(/"message":"([^"]{5,200})"/g)].map(m => m[1]))];
    console.log('Último nodo:', ln ? ln[1] : '?');
    msgs.slice(0, 5).forEach(m => console.log('→', m.substring(0, 200)));
  }
}

main().catch(e => console.error('Error:', e.message));
