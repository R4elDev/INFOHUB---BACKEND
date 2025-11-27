# 📚 **InfoHub API - Documentação Completa**

## 🎯 **Sistema de E-commerce Completo**

### **Base URL:** `http://localhost:8080/v1/infohub`

> **⚠️ IMPORTANTE - Atualizações 27/11/2025:**
> - ✅ **Erro 500 no sistema de posts foi CORRIGIDO**
> - ✅ **DAO de posts refatorado com prepared statements**  
> - ✅ **Segurança contra SQL injection implementada**
> - ✅ **Campos da tabela tbl_post alinhados com o código**
> - ✅ **Sistema funcionando perfeitamente**

---

## 📱 **Rede Social - Posts**

### **Criar Post**
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 3,
  "conteudo": "Compartilhando minha experiência com este produto incrível!",
  "titulo": "Produto Recomendado",
  "imagem": "https://exemplo.com/imagem.jpg"
}
```

### **Listar Feed de Posts**
```http
GET /posts/feed
Authorization: Bearer <token>
```

### **Listar Feed com Paginação**
```http
GET /posts/feed/{page}/{limit}
Authorization: Bearer <token>
```

### **Listar Posts do Usuário**
```http
GET /posts/usuario/{id_usuario}
Authorization: Bearer <token>
```

### **Listar Posts do Usuário com Paginação**
```http
GET /posts/usuario/{id_usuario}/{page}/{limit}
Authorization: Bearer <token>
```

### **Buscar Post por ID**
```http
GET /posts/{id_post}
Authorization: Bearer <token>
```

### **Atualizar Post**
```http
PUT /posts/{id_post}
Authorization: Bearer <token>
Content-Type: application/json

{
  "conteudo": "Conteúdo atualizado do post",
  "titulo": "Novo título"
}
```

### **Deletar Post**
```http
DELETE /posts/{id_post}
Authorization: Bearer <token>
```

### **Curtir/Descurtir Post**
```http
POST /posts/{id_post}/curtir
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 3
}
```

### **Verificar se Usuário Curtiu**
```http
GET /posts/{id_post}/curtida/{id_usuario}
Authorization: Bearer <token>
```

### **Comentar em Post**
```http
POST /posts/{id_post}/comentarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 3,
  "conteudo": "Ótimo post! Concordo totalmente."
}
```

### **Listar Comentários do Post**
```http
GET /posts/{id_post}/comentarios
Authorization: Bearer <token>
```

### **Atualizar Comentário**
```http
PUT /comentarios/{id_comentario}
Authorization: Bearer <token>
Content-Type: application/json

{
  "conteudo": "Comentário atualizado"
}
```

### **Deletar Comentário**
```http
DELETE /comentarios/{id_comentario}
Authorization: Bearer <token>
```

---

## 🛍️ **Carrinho de Compras**

### **Adicionar Item ao Carrinho**
```http
POST /carrinho
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_produto": 5,
  "quantidade": 2
}
```

### **Listar Carrinho do Usuário**
```http
GET /carrinho/{id_usuario}
Authorization: Bearer <token>
```

### **Atualizar Quantidade no Carrinho**
```http
PUT /carrinho
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_produto": 5,
  "quantidade": 3
}
```

### **Remover Item do Carrinho**
```http
DELETE /carrinho/{id_usuario}/{id_produto}
Authorization: Bearer <token>
```

### **Limpar Carrinho Completo**
```http
DELETE /carrinho/{id_usuario}
Authorization: Bearer <token>
```

### **Contar Itens no Carrinho**
```http
GET /carrinho/{id_usuario}/count
Authorization: Bearer <token>
```

### **Calcular Total do Carrinho**
```http
GET /carrinho/{id_usuario}/total
Authorization: Bearer <token>
```

---

## 💳 **Compras**

### **Processar Compra do Carrinho**
```http
POST /compra/carrinho
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_estabelecimento": 2,
  "metodo_pagamento": "cartao",
  "dados_cartao": {
    "numero": "1234567890123456",
    "cvv": "123"
  }
}
```

### **Listar Compras do Usuário**
```http
GET /compras/usuario/{id_usuario}
Authorization: Bearer <token>
```

### **Buscar Compra Específica**
```http
GET /compra/{id_compra}
Authorization: Bearer <token>
```

### **Listar Todas as Compras (Admin)**
```http
GET /compras
Authorization: Bearer <admin_token>
```

### **Listar Compras por Status (Admin)**
```http
GET /compras/status/{status}
Authorization: Bearer <admin_token>
```
**Status válidos:** `pendente`, `confirmada`, `processando`, `enviada`, `entregue`, `cancelada`

### **Atualizar Status da Compra (Admin)**
```http
PUT /compra/{id_compra}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmada"
}
```

### **Cancelar Compra**
```http
PUT /compra/{id_compra}/cancelar
Authorization: Bearer <token>
```

---

## ❤️ **Favoritos**

### **Adicionar aos Favoritos**
```http
POST /favoritos
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_produto": 5
}
```

### **Alternar Favorito (Add/Remove)**
```http
POST /favoritos/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_produto": 5
}
```

### **Listar Favoritos do Usuário**
```http
GET /favoritos/{id_usuario}
Authorization: Bearer <token>
```

### **Verificar se é Favorito**
```http
GET /favoritos/{id_usuario}/{id_produto}/check
Authorization: Bearer <token>
```

### **Favoritos em Promoção**
```http
GET /favoritos/{id_usuario}/promocoes
Authorization: Bearer <token>
```

### **Produtos Mais Favoritados**
```http
GET /favoritos/mais-favoritados/{limit}
# Público - sem autenticação
```

### **Contar Favoritos**
```http
GET /favoritos/{id_usuario}/count
Authorization: Bearer <token>
```

### **Remover dos Favoritos**
```http
DELETE /favoritos/{id_usuario}/{id_produto}
Authorization: Bearer <token>
```

---

## 🔔 **Notificações**

### **Listar Notificações do Usuário**
```http
GET /notificacoes/{id_usuario}?limit=20
Authorization: Bearer <token>
```

### **Notificações Não Lidas**
```http
GET /notificacoes/{id_usuario}/nao-lidas
Authorization: Bearer <token>
```

### **Contar Não Lidas**
```http
GET /notificacoes/{id_usuario}/count
Authorization: Bearer <token>
```

### **Marcar Como Lida**
```http
PUT /notificacoes/{id_notificacao}/lida
Authorization: Bearer <token>
```

### **Marcar Todas Como Lidas**
```http
PUT /notificacoes/{id_usuario}/marcar-todas-lidas
Authorization: Bearer <token>
```

### **Notificações por Tipo**
```http
GET /notificacoes/{id_usuario}/tipo/{tipo}
Authorization: Bearer <token>
```
**Tipos:** `promocao`, `alerta`, `social`, `compra`, `carrinho`

### **Deletar Notificação**
```http
DELETE /notificacoes/{id_notificacao}
Authorization: Bearer <token>
```

### **Criar Notificação (Admin)**
```http
POST /notificacoes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id_usuario": 1,
  "mensagem": "Sua promoção favorita está ativa!",
  "tipo": "promocao"
}
```

---

## ⭐ **Avaliações**

### **Criar Avaliação**
```http
POST /avaliacoes
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_produto": 5,
  "nota": 4,
  "comentario": "Produto muito bom!"
}
```

### **Avaliar Estabelecimento**
```http
POST /avaliacoes
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_usuario": 1,
  "id_estabelecimento": 2,
  "nota": 5,
  "comentario": "Atendimento excelente!"
}
```

### **Listar Avaliações de Produto**
```http
GET /avaliacoes/produto/{id_produto}
# Público
```

### **Listar Avaliações de Estabelecimento**
```http
GET /avaliacoes/estabelecimento/{id_estabelecimento}
# Público
```

### **Avaliações do Usuário**
```http
GET /avaliacoes/usuario/{id_usuario}
Authorization: Bearer <token>
```

### **Estatísticas de Produto**
```http
GET /avaliacoes/produto/{id_produto}/estatisticas
# Público
```

### **Estatísticas de Estabelecimento**
```http
GET /avaliacoes/estabelecimento/{id_estabelecimento}/estatisticas
# Público
```

### **Produtos Mais Bem Avaliados**
```http
GET /avaliacoes/produtos/mais-bem-avaliados/{limit}
# Público
```

### **Verificar se Pode Avaliar**
```http
GET /avaliacoes/pode-avaliar/{id_usuario}/{id_produto}
Authorization: Bearer <token>
```

### **Atualizar Avaliação**
```http
PUT /avaliacoes/{id_avaliacao}
Authorization: Bearer <token>
Content-Type: application/json

{
  "nota": 5,
  "comentario": "Mudei de opinião, produto excelente!"
}
```

### **Deletar Avaliação**
```http
DELETE /avaliacoes/{id_avaliacao}
Authorization: Bearer <token>
```

---

## 👥 **Tipos de Usuário e Permissões**

### **Consumidor (Padrão)**
- ✅ Gerenciar próprio carrinho e favoritos
- ✅ Fazer compras e avaliar produtos
- ✅ Ver próprias notificações e compras
- ❌ Não pode acessar dados de outros usuários

### **Administrador**
- ✅ Acesso total a todas as funcionalidades
- ✅ Gerenciar compras de todos os usuários
- ✅ Criar notificações e produtos
- ✅ Ver relatórios e estatísticas globais

### **Estabelecimento**
- ✅ Gerenciar produtos e promoções
- ✅ Atualizar status de compras
- ✅ Ver compras do estabelecimento
- ❌ Acesso limitado comparado ao admin

---

## 📊 **Exemplos de Resposta**

### **Sucesso - Post Criado**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Post criado com sucesso.",
  "data": {
    "id_post": 2,
    "id_usuario": 3,
    "titulo": null,
    "conteudo": "teste 333\n\nfazendo o teste para ver se vai dar certo",
    "imagem": null,
    "data_criacao": "2025-11-27T00:18:35.000Z"
  }
}
```

### **Sucesso - Carrinho**
```json
{
  "status": true,
  "status_code": 200,
  "message": "Carrinho encontrado com sucesso.",
  "data": {
    "itens": [
      {
        "id_carrinho": 1,
        "id_produto": 5,
        "nome_produto": "Leite Integral 1L",
        "quantidade": 2,
        "preco_atual": "4.99",
        "preco_promocional": "3.99"
      }
    ],
    "resumo": {
      "total_itens": 1,
      "total_produtos": 2,
      "valor_total": "7.98"
    }
  }
}
```

### **Sucesso - Compra Processada**
```json
{
  "status": true,
  "status_code": 201,
  "message": "Compra processada com sucesso.",
  "data": {
    "id_compra": 15,
    "id_usuario": 1,
    "valor_total": "25.90",
    "status_compra": "pendente",
    "data_compra": "2025-11-11T10:30:00.000Z"
  }
}
```

### **Erro - Validação**
```json
{
  "status": false,
  "status_code": 400,
  "message": "Campos 'id_usuario' e 'id_produto' são obrigatórios."
}
```

### **Erro - Permissão**
```json
{
  "status": false,
  "status_code": 403,
  "message": "Acesso negado. Apenas administradores podem acessar esta funcionalidade."
}
```

---

## 🔄 **Fluxo Completo de Compra**

1. **Adicionar produtos ao carrinho**
   ```http
   POST /carrinho
   ```

2. **Verificar carrinho e total**
   ```http
   GET /carrinho/{id_usuario}
   GET /carrinho/{id_usuario}/total
   ```

3. **Processar compra**
   ```http
   POST /compra/carrinho
   ```

4. **Acompanhar status**
   ```http
   GET /compra/{id_compra}
   ```

5. **Receber notificações**
   ```http
   GET /notificacoes/{id_usuario}/nao-lidas
   ```

6. **Avaliar produto/estabelecimento**
   ```http
   POST /avaliacoes
   ```

---

## 🚀 **Recursos Automáticos**

### **Notificações Automáticas**
- 🔥 Favoritos em promoção
- 📦 Status de compra alterado
- 🛒 Carrinho abandonado (24h)
- ✅ Compra confirmada

### **Triggers do Banco**
- 🔄 Cálculo automático de subtotais
- 📢 Notificação quando favorito entra em promoção
- 📊 Atualização de estatísticas em tempo real

### **Segurança**
- 🔐 JWT para autenticação
- 🛡️ Middlewares de permissão
- 🔒 Validação de dados em todas as rotas
- 👤 Controle de acesso por tipo de usuário

---

## 📋 **Códigos de Status**

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| `200` | OK | Operação bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos ou faltando |
| `401` | Unauthorized | Token inválido ou ausente |
| `403` | Forbidden | Sem permissão para acessar |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: item já nos favoritos) |
| `500` | Internal Error | Erro interno do servidor |

---

**🎉 Sistema completo implementado com:**
- ✅ **Rede Social - Posts com comentários e curtidas** *(CORRIGIDO - 27/11/2025)*
- ✅ Carrinho de compras funcional
- ✅ Sistema de compras com múltiplos status
- ✅ Favoritos com notificação de promoções
- ✅ Sistema completo de notificações
- ✅ Avaliações de produtos e estabelecimentos
- ✅ Controle de permissões por tipo de usuário
- ✅ Integração com IA existente
- ✅ Triggers automáticos no banco de dados
- ✅ Segurança com prepared statements (SQL injection prevention)