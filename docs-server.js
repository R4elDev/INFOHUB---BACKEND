const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8081;

// Servir arquivos estáticos
app.use(express.static('.'));

// Endpoint para documentação
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>InfoHub API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            })
        }
    </script>
</body>
</html>
  `);
});

// Endpoint para servir o YAML
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

app.listen(port, () => {
  console.log(`📋 InfoHub API Documentation disponível em:`);
  console.log(`🌐 http://localhost:${port}`);
  console.log(``);
  console.log(`📁 Arquivos de documentação:`);
  console.log(`- swagger.yaml - Especificação OpenAPI`);
  console.log(`- README_API.md - Guia de uso`);
  console.log(`- api-examples.js - Exemplos de código`);
  console.log(``);
  console.log(`🚀 Para parar o servidor: Ctrl+C`);
});