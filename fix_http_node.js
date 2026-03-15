const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDM5NjI4Ni02YzVhLTQ5YzMtOTQ1YS1lYWM5NzY1ZTIxZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjk4ODA3ZjYtMmIzZi00MWE0LTljNTctN2M0NjdiZTExOWM5IiwiaWF0IjoxNzczMjMzODQ5fQ.16IFkBnSEtkTNHX1YNcEXxJyuajzZROW-m63NYytJuY';
const WF_ID = 'PORMWG16pLCmGGe3';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: GET the workflow
  const getRes = await request({
    hostname: 'n8n.cruzn8n.com',
    path: `/api/v1/workflows/${WF_ID}`,
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    rejectUnauthorized: false
  });

  console.log('GET Status:', getRes.status);
  const wf = JSON.parse(getRes.data);

  // Step 2: Find and fix the HTTP Request node
  const httpNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.httpRequest');
  if (!httpNode) {
    console.log('ERROR: HTTP Request node not found');
    return;
  }

  console.log('\nCurrent parameters:');
  console.log(JSON.stringify(httpNode.parameters, null, 2));

  // Fix: replace bodyContentType/body with specifyBody/jsonBody
  httpNode.parameters = {
    method: 'POST',
    url: 'https://sheets.googleapis.com/v4/spreadsheets',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'googleSheetsOAuth2Api',
    sendHeaders: true,
    headerParameters: {
      parameters: [
        { name: 'Content-Type', value: 'application/json' }
      ]
    },
    sendBody: true,
    specifyBody: 'json',
    jsonBody: JSON.stringify({
      properties: { title: 'Resumen Diario Hotel' },
      sheets: [
        { properties: { title: 'Pagos' } },
        { properties: { title: 'Resumen Diario' } }
      ]
    })
  };

  console.log('\nFixed parameters:');
  console.log(JSON.stringify(httpNode.parameters, null, 2));

  // Step 3: PUT the updated workflow
  const payload = JSON.stringify({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null
  });

  const putRes = await request({
    hostname: 'n8n.cruzn8n.com',
    path: `/api/v1/workflows/${WF_ID}`,
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    rejectUnauthorized: false
  }, payload);

  console.log('\nPUT Status:', putRes.status);
  if (putRes.status !== 200) {
    console.log('Error response:', putRes.data.substring(0, 1000));
  } else {
    const updated = JSON.parse(putRes.data);
    const updatedNode = updated.nodes.find(n => n.type === 'n8n-nodes-base.httpRequest');
    console.log('SUCCESS - Updated node parameters:');
    console.log(JSON.stringify(updatedNode.parameters, null, 2));
  }
}

main().catch(console.error);
