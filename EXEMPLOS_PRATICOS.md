# 🎯 **Exemplos Práticos - InfoHub E-commerce API**

## 🛒 **Fluxo Completo: Do Produto ao Pagamento**

### **Cenário:** João quer comprar leite e pão no SuperMercado ABC

---

### **1. 👤 Login do Usuário**

```bash
curl -X POST http://localhost:8080/v1/infohub/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "123456"
  }'
```

**Resposta:**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Login realizado com sucesso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "tipo_usuario": "consumidor"
    }
  }
}
```

---

### **2. 🔍 Buscar Produtos**

```bash
# Listar produtos disponíveis
curl -X GET http://localhost:8080/v1/infohub/produto \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**
```json
{
  "status": true,
  "data": [
    {
      "id": 5,
      "nome": "Leite Integral 1L",
      "preco": "4.99",
      "preco_promocional": "3.99",
      "estabelecimento": "SuperMercado ABC"
    },
    {
      "id": 8,
      "nome": "Pão Francês 500g",
      "preco": "6.50",
      "preco_promocional": null,
      "estabelecimento": "SuperMercado ABC"
    }
  ]
}
```

---

### **3. ❤️ Adicionar aos Favoritos**

```bash
# João gosta do leite em promoção e adiciona aos favoritos
curl -X POST http://localhost:8080/v1/infohub/favoritos \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_produto": 5
  }'
```

**Resposta:**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Produto adicionado aos favoritos com sucesso.",
  "data": {
    "id_favorito": 3,
    "produto": "Leite Integral 1L",
    "data_adicao": "2025-11-11T10:30:00.000Z"
  }
}
```

---

### **4. 🛒 Adicionar ao Carrinho**

```bash
# Adicionar leite ao carrinho
curl -X POST http://localhost:8080/v1/infohub/carrinho \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_produto": 5,
    "quantidade": 2
  }'

# Adicionar pão ao carrinho
curl -X POST http://localhost:8080/v1/infohub/carrinho \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_produto": 8,
    "quantidade": 1
  }'
```

---

### **5. 📋 Verificar Carrinho**

```bash
curl -X GET http://localhost:8080/v1/infohub/carrinho/1 \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Resposta:**
```json
{
  "status": true,
  "data": {
    "itens": [
      {
        "id_carrinho": 1,
        "id_produto": 5,
        "nome_produto": "Leite Integral 1L",
        "quantidade": 2,
        "preco_atual": "4.99",
        "preco_promocional": "3.99",
        "subtotal": "7.98"
      },
      {
        "id_carrinho": 2,
        "id_produto": 8,
        "nome_produto": "Pão Francês 500g",
        "quantidade": 1,
        "preco_atual": "6.50",
        "preco_promocional": null,
        "subtotal": "6.50"
      }
    ],
    "resumo": {
      "total_itens": 2,
      "total_produtos": 3,
      "subtotal": "14.48",
      "desconto": "2.00",
      "valor_total": "14.48"
    }
  }
}
```

---

### **6. 💳 Processar Compra**

```bash
curl -X POST http://localhost:8080/v1/infohub/compra/carrinho \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_estabelecimento": 2,
    "metodo_pagamento": "cartao",
    "dados_cartao": {
      "numero": "1234567890123456",
      "cvv": "123"
    }
  }'
```

**Resposta:**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Compra processada com sucesso.",
  "data": {
    "id_compra": 15,
    "id_usuario": 1,
    "valor_total": "14.48",
    "status_compra": "pendente",
    "data_compra": "2025-11-11T10:45:00.000Z",
    "itens": [
      {
        "produto": "Leite Integral 1L",
        "quantidade": 2,
        "preco_unitario": "3.99"
      },
      {
        "produto": "Pão Francês 500g",
        "quantidade": 1,
        "preco_unitario": "6.50"
      }
    ]
  }
}
```

---

## 🔔 **Sistema de Notificações Automático**

### **Notificação: Favorito em Promoção**
O sistema automaticamente notifica quando um favorito entra em promoção:

```bash
# Verificar notificações
curl -X GET http://localhost:8080/v1/infohub/notificacoes/1/nao-lidas \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Resposta:**
```json
{
  "status": true,
  "data": [
    {
      "id_notificacao": 8,
      "mensagem": "🔥 Seu favorito 'Leite Integral 1L' está em promoção por R$ 3,99!",
      "tipo": "promocao",
      "data_criacao": "2025-11-11T09:00:00.000Z",
      "lida": false
    }
  ],
  "count": 1
}
```

---

## 👨‍💼 **Área Administrativa**

### **Admin: Atualizar Status da Compra**

```bash
# Admin confirma o pedido
curl -X PUT http://localhost:8080/v1/infohub/compra/15/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmada"
  }'
```

### **Admin: Criar Notificação em Massa**

```bash
curl -X POST http://localhost:8080/v1/infohub/notificacoes \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "mensagem": "🎉 Parabéns! Sua compra foi confirmada e será processada em breve!",
    "tipo": "compra"
  }'
```

---

## ⭐ **Sistema de Avaliações**

### **Avaliar Produto Após Compra**

```bash
# João avalia o leite que comprou
curl -X POST http://localhost:8080/v1/infohub/avaliacoes \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_produto": 5,
    "nota": 5,
    "comentario": "Leite fresquinho e preço ótimo na promoção!"
  }'
```

### **Ver Avaliações do Produto**

```bash
# Público pode ver avaliações
curl -X GET http://localhost:8080/v1/infohub/avaliacoes/produto/5
```

**Resposta:**
```json
{
  "status": true,
  "data": {
    "avaliacoes": [
      {
        "id_avaliacao": 12,
        "usuario": "João S.",
        "nota": 5,
        "comentario": "Leite fresquinho e preço ótimo na promoção!",
        "data_avaliacao": "2025-11-11T11:00:00.000Z"
      }
    ],
    "estatisticas": {
      "media": 4.8,
      "total_avaliacoes": 25,
      "distribuicao": {
        "5": 18,
        "4": 5,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

---

## 🎯 **Casos de Uso Avançados**

### **1. Carrinho Abandonado (24h depois)**

O sistema automaticamente envia notificação:

```json
{
  "mensagem": "🛒 Você esqueceu itens no seu carrinho! Finalize sua compra e aproveite os preços.",
  "tipo": "carrinho",
  "data_criacao": "2025-11-12T10:45:00.000Z"
}
```

### **2. Produtos Mais Favoritados**

```bash
# Top 10 produtos favoritos (público)
curl -X GET http://localhost:8080/v1/infohub/favoritos/mais-favoritados/10
```

### **3. Relatório de Vendas (Admin)**

```bash
# Listar todas as compras
curl -X GET http://localhost:8080/v1/infohub/compras \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Compras por status
curl -X GET http://localhost:8080/v1/infohub/compras/status/entregue \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔧 **Utilitários e Ferramentas**

### **Postman Collection**

Crie uma collection no Postman com estas requests:

```json
{
  "info": {
    "name": "InfoHub E-commerce API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/v1/infohub"
    },
    {
      "key": "token",
      "value": "SEU_TOKEN_AQUI"
    }
  ]
}
```

### **Script de Teste Automático**

```javascript
// test-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/v1/infohub';
let authToken = '';

async function testarFluxoCompleto() {
  try {
    // 1. Login
    const login = await axios.post(`${BASE_URL}/login`, {
      email: 'teste@email.com',
      senha: '123456'
    });
    
    authToken = login.data.data.token;
    console.log('✅ Login realizado');

    // 2. Adicionar ao carrinho
    await axios.post(`${BASE_URL}/carrinho`, {
      id_usuario: 1,
      id_produto: 5,
      quantidade: 2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item adicionado ao carrinho');

    // 3. Ver carrinho
    const carrinho = await axios.get(`${BASE_URL}/carrinho/1`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Carrinho:', carrinho.data.data.resumo);

    // 4. Processar compra
    const compra = await axios.post(`${BASE_URL}/compra/carrinho`, {
      id_usuario: 1,
      id_estabelecimento: 2,
      metodo_pagamento: 'pix'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Compra processada:', compra.data.data.id_compra);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarFluxoCompleto();
```

### **Docker Compose (Opcional)**

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: dbinfohub
    ports:
      - "3306:3306"
    volumes:
      - ./database:/docker-entrypoint-initdb.d

  api:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASS=root
      - DB_NAME=dbinfohub
```

---

## 🚨 **Exemplos de Tratamento de Erros**

### **Erro: Item já no carrinho**
```bash
# Tentar adicionar o mesmo item novamente
curl -X POST http://localhost:8080/v1/infohub/carrinho \
  -d '{"id_usuario": 1, "id_produto": 5, "quantidade": 1}'
```

**Resposta:**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Quantidade do item atualizada no carrinho.",
  "data": {
    "quantidade_anterior": 2,
    "quantidade_nova": 3
  }
}
```

### **Erro: Produto não encontrado**
```json
{
  "status": false,
  "status_code": 404,
  "message": "Produto não encontrado."
}
```

### **Erro: Sem permissão**
```json
{
  "status": false,
  "status_code": 403,
  "message": "Acesso negado. Apenas o proprietário ou administrador pode acessar este recurso."
}
```

---

## 📊 **Monitoramento em Tempo Real**

### **1. Logs de Atividade**
```bash
# Ver logs do servidor
tail -f logs/api.log

# Monitorar requests
npm run dev # mostra requests em tempo real
```

### **2. Métricas de Performance**
```javascript
// Adicionar middleware de métricas
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});
```

---

## 🎉 **Resumo: Sistema Completo Funcionando**

✅ **Carrinho de Compras:** Adicionar, remover, calcular totais  
✅ **Sistema de Compras:** Processamento completo com status  
✅ **Favoritos:** Lista de desejos com notificações  
✅ **Notificações:** Sistema automático e manual  
✅ **Avaliações:** Rating de produtos e estabelecimentos  
✅ **Permissões:** Controle de acesso por tipo de usuário  
✅ **Segurança:** JWT, validações, middlewares  
✅ **Documentação:** APIs documentadas e testadas  

**🚀 Pronto para produção!** Seu sistema e-commerce está completo e funcional!