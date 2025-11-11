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
  console.log(`\n� ============================================`);
  console.log(`📚 InfoHub API - Documentação Completa`);
  console.log(`============================================`);
  console.log(`🌐 Swagger UI: http://localhost:${port}`);
  console.log(`📖 YAML: http://localhost:${port}/swagger.yaml`);
  console.log(`\n📊 API Stats:`);
  console.log(`✅ 58+ Endpoints implementados`);
  console.log(`✅ 7 Módulos principais`);
  console.log(`✅ E-commerce completo`);
  console.log(`✅ Sistema de promoções`);
  console.log(`✅ Rede social integrada`);
  console.log(`✅ Chat IA inteligente`);
  console.log(`✅ Avaliações e favoritos`);
  console.log(`\n📁 Documentação disponível:`);
  console.log(`- swagger.yaml - Especificação OpenAPI 3.0`);
  console.log(`- README_API_COMPLETO.md - Guia completo`);
  console.log(`- api-examples.js - Exemplos práticos`);
  console.log(`\n🎯 Principais funcionalidades documentadas:`);
  console.log(`🛒 Carrinho e Pedidos`);
  console.log(`💰 Sistema de Promoções`);
  console.log(`🌐 Rede Social (Posts, Comentários, Curtidas)`);
  console.log(`⭐ Avaliações e Reviews`);
  console.log(`❤️ Lista de Favoritos`);
  console.log(`🤖 Chat IA Inteligente`);
  console.log(`� Gestão de Usuários`);
  console.log(`🔐 Autenticação JWT`);
  console.log(`\n🛡️ Segurança implementada:`);
  console.log(`✅ JWT Authentication`);
  console.log(`✅ Validação de dados`);
  console.log(`✅ Controle de acesso por roles`);
  console.log(`✅ Sanitização de inputs`);
  console.log(`\n💡 Dica: Use Ctrl+C para parar o servidor`);
  console.log(`============================================\n`);
});