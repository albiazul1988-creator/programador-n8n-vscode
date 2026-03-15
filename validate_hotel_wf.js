const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const options = {
  hostname: 'n8n.cruzn8n.com',
  path: '/api/v1/workflows/nzEDj427QOh8B0H9',
  method: 'GET',
  agent,
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const wf = JSON.parse(data);
    const errors = [];

    console.log('=== VALIDATION RESULT ===');
    console.log('Workflow:', wf.name, '| ID:', wf.id);
    console.log('Nodes checked:');

    for (const node of wf.nodes) {
      if (node.type === 'n8n-nodes-base.googleSheets') {
        const docId = (node.parameters && node.parameters.documentId) ? node.parameters.documentId.value : 'MISSING';
        const creds = node.credentials ? node.credentials.googleSheetsOAuth2Api : null;
        const credId = creds ? creds.id : null;
        const credName = creds ? creds.name : null;

        const isPlaceholder = (docId === 'PEGA_URL_DE_TU_GOOGLE_SHEET' || docId === 'MISSING');
        if (isPlaceholder) errors.push(node.name + ': documentId still placeholder or missing');
        if (credId === null) errors.push(node.name + ': missing credential');

        const status = (isPlaceholder || credId === null) ? '[FAIL]' : '[OK]';
        console.log('  ' + status + ' ' + node.name);
        console.log('         documentId: ' + docId);
        console.log('         credential: ' + credName + ' (' + credId + ')');
      }
    }

    console.log('');
    if (errors.length === 0) {
      console.log('VALIDATION PASSED: All Google Sheets nodes have real spreadsheet ID and credentials. No errors.');
    } else {
      console.log('VALIDATION ERRORS:');
      errors.forEach(function(e) { console.log(' - ' + e); });
    }
  });
});
req.on('error', function(e) { console.error('ERROR:', e.message); });
req.end();
