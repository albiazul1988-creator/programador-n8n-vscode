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

// Estrategia: "GPT Genera Email Bienvenida" recibe datos de "Extraer Variables"
// y los pasa TODOS hacia adelante junto con html_bienvenida.
// Así todos los nodos siguientes solo usan $json.xxx sin referencias cruzadas.

async function main() {
  const get = await req('GET', '/api/v1/workflows/s7jp68fMhdhoU0AK', null);

  const nodes = get.b.nodes.map(n => {
    // Nodo 1 Set: recibe de Extraer Variables, genera HTML + pasa todos los campos
    if (n.name === 'GPT Genera Email Bienvenida') {
      return {
        ...n,
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        credentials: {},
        parameters: {
          mode: 'manual',
          duplicateItem: false,
          assignments: {
            assignments: [
              { id: 'g1', name: 'html_bienvenida',
                value: '={{ "<h2>Bienvenido a LeadPilot, " + $json.cliente_nombre + "!</h2><p>Tu sistema de captación automática ya está en marcha.</p><p><b>Plan:</b> " + $json.plan + " | <b>Ciudad:</b> " + $json.ciudad + "</p><p>Cada lunes el sistema buscará nuevos clientes en " + $json.categorias + " y les enviará propuestas por WhatsApp.</p><p>Cada viernes recibirás tu reporte.</p><p>Un saludo,<br/><b>" + $json.nombre_remitente + "</b> — Cruz Digital</p>" }}',
                type: 'string' },
              { id: 'g2', name: 'cliente_nombre',   value: '={{ $json.cliente_nombre }}',   type: 'string' },
              { id: 'g3', name: 'email_cliente',    value: '={{ $json.email_cliente }}',    type: 'string' },
              { id: 'g4', name: 'plan',             value: '={{ $json.plan }}',             type: 'string' },
              { id: 'g5', name: 'ciudad',           value: '={{ $json.ciudad }}',           type: 'string' },
              { id: 'g6', name: 'categorias',       value: '={{ $json.categorias }}',       type: 'string' },
              { id: 'g7', name: 'nombre_remitente', value: '={{ $json.nombre_remitente }}', type: 'string' },
              { id: 'g8', name: 'sheet_id_maestro', value: '1CBFvRfz4ZQIJD-pxVfSdZNQkai9raEeSGTOkuRe8aPU', type: 'string' },
              { id: 'g9', name: 'sheet_id_cliente', value: '={{ $json.sheet_id_cliente || "" }}', type: 'string' },
              { id: 'g10', name: 'fecha_inicio',    value: '={{ new Date().toISOString().split("T")[0] }}', type: 'string' },
            ]
          },
          options: {}
        }
      };
    }

    // Nodo 2 Set: recibe de GPT node, solo pasa todo hacia adelante (no cross-reference)
    if (n.name === 'Preparar Datos para Guardar') {
      return {
        ...n,
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        parameters: {
          mode: 'passThrough', // pasar todos los campos sin cambiarlos
          options: {}
        }
      };
    }

    return n;
  });

  // Actualizar Google Sheets: ahora usa $json.xxx directo (ya no necesita $('Preparar...'))
  const nodesFixed = nodes.map(n => {
    if (n.name === 'Registrar Cliente en Sheet Maestro') {
      n.parameters.columns.value = {
        Nombre_Cliente:   '={{ $json.cliente_nombre }}',
        Email_Cliente:    '={{ $json.email_cliente }}',
        Plan:             '={{ $json.plan }}',
        Ciudad:           '={{ $json.ciudad }}',
        Categorias:       '={{ $json.categorias }}',
        Nombre_Remitente: '={{ $json.nombre_remitente }}',
        Estado:           'activo',
        Fecha_Inicio:     '={{ $json.fecha_inicio }}',
        Limite_Semanal:   50,
        Sheet_ID:         '={{ $json.sheet_id_cliente }}',
      };
    }
    return n;
  });

  const put = await req('PUT', '/api/v1/workflows/s7jp68fMhdhoU0AK', {
    name: get.b.name, nodes: nodesFixed, connections: get.b.connections, settings: get.b.settings || {}
  });
  console.log('WF-05 refactorizado:', put.s === 200 ? '✓' : '✗ ' + JSON.stringify(put.b).substring(0, 200));
}

main().catch(e => console.error(e.message));
