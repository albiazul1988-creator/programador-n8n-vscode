const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_URL = 'n8n.cruzn8n.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';

const WORKFLOWS = [
  'workflows/mrr-system/01-prospeccion.json',
  'workflows/mrr-system/02-propuestas-whatsapp.json',
  'workflows/mrr-system/03-followup-email.json',
  'workflows/mrr-system/04-reporte-semanal.json',
  'workflows/mrr-system/05-onboarding-cliente.json',
  'workflows/mrr-system/06-produccion-maestro.json',
];

function postWorkflow(wfData) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(wfData);
    const options = {
      hostname: N8N_URL,
      port: 443,
      path: '/api/v1/workflows',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Importando workflows MRR-System a n8n ===\n');

  for (const filePath of WORKFLOWS) {
    const fullPath = path.join(__dirname, filePath);
    const wfData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const wfName = wfData.name;

    process.stdout.write(`Importando: ${wfName} ... `);
    try {
      const result = await postWorkflow(wfData);
      if (result.status === 200 || result.status === 201) {
        const id = result.body.id || result.body.data?.id || '?';
        console.log(`✓ OK (ID: ${id})`);
      } else {
        console.log(`✗ Error ${result.status}: ${JSON.stringify(result.body).substring(0, 120)}`);
      }
    } catch (err) {
      console.log(`✗ Error de red: ${err.message}`);
    }

    // Pequeña pausa entre requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== Importación completada ===');
  console.log('Próximos pasos:');
  console.log('1. Crear Google Sheet CLIENTES_SERVICIO (columnas: Nombre_Cliente, Email_Cliente, Plan, Ciudad, Categorias, Nombre_Remitente, Estado, Fecha_Inicio, Limite_Semanal, Sheet_ID)');
  console.log('2. Reemplazar REEMPLAZAR_CON_ID_SHEET_CLIENTES_SERVICIO en WF-03, WF-04, WF-05, WF-06');
  console.log('3. Activar WF-01 y WF-02 en n8n para que sus webhooks funcionen');
}

main();
