const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';
const BASE_URL = 'https://n8n.cruzn8n.com';

const workflows = [
  { id: 'BFqEMf5ZagjpJoVG', name: 'Test with creds' },
  { id: 'qr9UDAFeCKZMhAOk', name: 'Test' },
  { id: 'ukbE7hiSSQjwP6pv', name: 'Test node props' },
  { id: 'hWSLU897fOE3SXS8', name: 'Email Scrapper Test' },
  { id: 'PORMWG16pLCmGGe3', name: 'Crear Google Sheet Hotel (temporal)' },
];

const deleteWorkflow = (wf) => {
  return new Promise((resolve) => {
    const path = '/api/v1/workflows/' + wf.id;
    const options = {
      hostname: 'n8n.cruzn8n.com',
      port: 443,
      path: path,
      method: 'DELETE',
      headers: { 'X-N8N-API-KEY': API_KEY },
      agent: agent,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ id: wf.id, name: wf.name, status: res.statusCode, body: data });
      });
    });
    req.on('error', (e) => { resolve({ id: wf.id, name: wf.name, error: e.message }); });
    req.end();
  });
};

Promise.all(workflows.map(deleteWorkflow)).then((results) => {
  results.forEach((r) => {
    if (r.error) {
      console.log('FAIL [' + r.id + '] ' + r.name + ': ' + r.error);
    } else if (r.status === 200 || r.status === 204) {
      console.log('OK   [' + r.id + '] ' + r.name + ': HTTP ' + r.status);
    } else {
      console.log('ERR  [' + r.id + '] ' + r.name + ': HTTP ' + r.status + ' -- ' + r.body);
    }
  });
});
