# 📋 Documentação API - InfoHub

Este arquivo contém a documentação completa da API do InfoHub, incluindo tanto o serviço principal (Node.js) quanto o serviço de IA (Python).

## 🚀 Como usar esta documentação

### 1. **Swagger UI**
```bash
# Instalar swagger-ui-serve globalmente
npm install -g swagger-ui-serve

# Servir a documentação na porta 8081
swagger-ui-serve swagger.yaml -p 8081
```

### 2. **VS Code**
- Instale a extensão "Swagger Viewer"
- Abra o arquivo `swagger.yaml`
- Use `Ctrl+Shift+P` → "Preview Swagger"

### 3. **Online**
- Acesse https://editor.swagger.io/
- Cole o conteúdo do `swagger.yaml`

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Principal  │    │  Serviço IA     │
│                 │    │   (Node.js)     │    │   (Python)      │
│   React/Vue     │◄──►│   Port: 8080    │◄──►│   Port: 5001    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     MySQL       │    │   Cache/AI      │
                       │   (Prisma)      │    │   Lightning     │
                       └─────────────────┘    └─────────────────┘
```

## 📡 Endpoints Principais

### 🔐 **Autenticação** 
- `POST /v1/infohub/login` - Login e obtenção de token JWT

### 👥 **Usuários**
- `POST /v1/infohub/usuarios/cadastro` - Cadastrar usuário
- `GET /v1/infohub/usuarios` - Listar usuários (protegido)
- `GET /v1/infohub/usuario/{id}` - Buscar usuário (protegido)
- `PUT /v1/infohub/usuario/{id}` - Atualizar usuário (protegido)
- `DELETE /v1/infohub/usuario/{id}` - Deletar usuário (protegido)

### 🔑 **Recuperação de Senha**
- `POST /v1/infohub/recuperar-senha` - Solicitar código
- `POST /v1/infohub/validar-codigo` - Validar código
- `POST /v1/infohub/redefinir-senha` - Redefinir senha

### 🤖 **Chat IA**
- `POST /v1/infohub/interagir` - Chat principal (protegido)
- `POST /5001/chat` - Chat direto IA (não protegido)

## 🔒 Autenticação

Rotas protegidas requerem JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Como obter token:
```javascript
const response = await fetch('http://localhost:8080/v1/infohub/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    senha: 'senha123'
  })
});

const data = await response.json();
const token = data.token;
```

## 🚀 Performance - Serviço IA

O serviço de IA foi otimizado para velocidade:

- **⚡ Lightning Mode**: Respostas em 0-5ms (90% dos casos)
- **🧠 AI Backup**: 200-500ms quando necessário
- **🎯 Target**: < 100ms sempre

### Tipos de resposta:
- `greeting` - Saudações instantâneas
- `general_promotions` - Lista geral de promoções
- `promotion_search` - Busca específica com banco
- `best_nearby` - Melhores preços por região
- `how_it_works` - Tutorial do sistema
- `product_catalog` - Lista de produtos

## 🧪 Exemplos de Uso

### 1. **Cadastro de Usuário**
```bash
curl -X POST http://localhost:8080/v1/infohub/usuarios/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "123456",
    "data_nascimento": "1990-05-15",
    "telefone": "(11) 99999-9999"
  }'
```

### 2. **Login**
```bash
curl -X POST http://localhost:8080/v1/infohub/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "123456"
  }'
```

### 3. **Chat com IA**
```bash
curl -X POST http://localhost:8080/v1/infohub/interagir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "mensagem": "quais as promoções de leite?",
    "idUsuario": 1
  }'
```

### 4. **Chat direto IA (sem auth)**
```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "oi",
    "user_id": 1
  }'
```

## 📊 Monitoramento

### Status dos serviços:
- **API Principal**: `GET http://localhost:8080/` (via app.js)
- **IA Service**: `GET http://localhost:5001/health`
- **Estatísticas IA**: `GET http://localhost:5001/stats`

### Métricas importantes:
- Cache hit rate
- Tempo médio de resposta
- Uso de AI vs regras
- Total de requisições

## 🔧 Configuração de Desenvolvimento

### Variáveis de ambiente necessárias:
```env
# Node.js (.env)
DATABASE_URL="mysql://user:password@localhost:3306/infohub"
JWT_SECRET="seu_jwt_secret_aqui"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="seu_email@gmail.com"
EMAIL_PASS="sua_senha_app"

# Python (config.py)
MYSQL_HOST="localhost"
MYSQL_USER="root"
MYSQL_PASSWORD="password"
MYSQL_DATABASE="infohub"
```

### Iniciar serviços:
```bash
# Terminal 1 - API Principal
cd INFOHUB---BACKEND
npm install
npm start

# Terminal 2 - Serviço IA
cd python_agents
pip install -r requirements.txt
python server_fast.py
```

## 📝 Notas Importantes

1. **CORS**: Configurado para aceitar requisições de qualquer origem
2. **Rate Limiting**: Não implementado ainda
3. **Logs**: Disponíveis no console dos serviços
4. **Backup**: Sistema híbrido garante disponibilidade mesmo se LLM falhar
5. **Cache**: Sistema de cache inteligente no serviço IA

## 🆘 Suporte

Para problemas ou dúvidas:
- Verifique os logs dos serviços
- Teste endpoints com `/health` e `/stats`
- Confirme que ambos serviços estão rodando
- Verifique configuração do banco MySQL

---

**Versão**: 1.0.0  
**Última atualização**: $(Get-Date -Format "yyyy-MM-dd")  
**Arquitetura**: Node.js + Python + MySQL