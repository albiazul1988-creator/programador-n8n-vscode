const https = require('https');
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';

const options = {
  hostname: 'n8n.cruzn8n.com',
  path: '/api/v1/executions?workflowId=rTyTaq41S3a9B82m&limit=1',
  method: 'GET',
  headers: { 'X-N8N-API-KEY': API_KEY },
  rejectUnauthorized: false
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const r = JSON.parse(data);
    const exec = r.data && r.data[0];
    if (!exec) { console.log('Sin ejecuciones'); return; }
    console.log('ID:', exec.id, '| Status:', exec.status);

    const opts2 = {
      hostname: 'n8n.cruzn8n.com',
      path: '/api/v1/executions/' + exec.id + '?includeData=true',
      method: 'GET',
      headers: { 'X-N8N-API-KEY': API_KEY },
      rejectUnauthorized: false
    };
    const req2 = https.request(opts2, res2 => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => {
        const r2 = JSON.parse(d2);
        const nodeData = r2.data && r2.data.resultData && r2.data.resultData.runData;
        if (!nodeData) { console.log('Sin detalles'); return; }
        for (const nodeName of Object.keys(nodeData)) {
          const run = nodeData[nodeName][0];
          if (run && run.error) {
            console.log('\nERROR en: ' + nodeName);
            console.log('Mensaje: ' + run.error.message);
            console.log('Detalle: ' + (run.error.description || run.error.httpCode || ''));
          }
        }
        console.log('\nNodos ejecutados: ' + Object.keys(nodeData).join(', '));
      });
    });
    req2.on('error', e => console.log('ERROR:', e.message));
    req2.end();
  });
});
req.on('error', e => console.log('ERROR:', e.message));
req.end();
