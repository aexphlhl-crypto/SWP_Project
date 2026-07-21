const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync('temp_api.json', 'utf8'));

const postman = {
  info: {
    name: 'CineBook API Collection (Auto-generated)',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [],
  variable: [
    { key: 'baseUrl', value: 'http://localhost:8080', type: 'string' },
    { key: 'token', value: '', type: 'string' }
  ]
};

const tagsMap = {};
Object.keys(openapi.paths).forEach(path => {
  const methods = openapi.paths[path];
  Object.keys(methods).forEach(method => {
    const op = methods[method];
    const tag = op.tags ? op.tags[0] : 'Default';
    if (!tagsMap[tag]) tagsMap[tag] = [];
    
    const item = {
      name: op.summary || op.operationId || path,
      request: {
        method: method.toUpperCase(),
        url: {
          raw: '{{baseUrl}}' + path,
          host: ['{{baseUrl}}'],
          path: path.split('/').filter(p => p),
          query: (op.parameters || []).filter(p => p.in === 'query').map(p => ({
            key: p.name,
            value: '<' + (p.schema ? p.schema.type : 'string') + '>'
          }))
        }
      }
    };
    
    if (op.security && op.security.length > 0) {
      item.request.header = [{ key: 'Authorization', value: 'Bearer {{token}}', type: 'text' }];
    }
    
    if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
      const schemaRef = op.requestBody.content['application/json'].schema['$ref'];
      let example = {};
      if (schemaRef) {
        const schemaName = schemaRef.split('/').pop();
        const schema = openapi.components.schemas[schemaName];
        if (schema && schema.properties) {
          Object.keys(schema.properties).forEach(prop => {
            const propDef = schema.properties[prop];
            if (propDef.type === 'string') example[prop] = 'string';
            else if (propDef.type === 'integer' || propDef.type === 'number') example[prop] = 0;
            else if (propDef.type === 'boolean') example[prop] = true;
            else example[prop] = {};
          });
        }
      }
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(example, null, 2),
        options: { raw: { language: 'json' } }
      };
    }
    
    tagsMap[tag].push(item);
  });
});

Object.keys(tagsMap).forEach(tag => {
  postman.item.push({
    name: tag,
    item: tagsMap[tag]
  });
});

fs.writeFileSync('CineBook_Postman_Collection.json', JSON.stringify(postman, null, 2));

let md = '# CineBook API Documentation\n\n> Base URL: http://localhost:8080\n\n';
Object.keys(tagsMap).forEach(tag => {
  md += '## ' + tag + '\n\n';
  const endpoints = tagsMap[tag];
  endpoints.forEach(ep => {
    md += '### ' + ep.name + '\n';
    md += '**' + ep.request.method + '** ' + ep.request.url.raw.replace('{{baseUrl}}', '') + '\n\n';
    if (ep.request.header && ep.request.header.length > 0) {
      md += '- **Auth required**: Yes (Bearer Token)\n';
    } else {
      md += '- **Auth required**: No\n';
    }
    
    if (ep.request.url.query && ep.request.url.query.length > 0) {
      md += '- **Query Parameters**:\n';
      ep.request.url.query.forEach(q => {
        md += '  - ' + q.key + ': ' + q.value + '\n';
      });
    }
    
    if (ep.request.body && ep.request.body.raw !== '{}') {
      md += '- **Request Body** (application/json):\n';
      md += '`json\n' + ep.request.body.raw + '\n`\n';
    }
    md += '\n---\n\n';
  });
});

fs.writeFileSync('docs/API_Documentation.md', md);
console.log('API docs generated');
