# 🛍️ InfoHub Backend

> **Plataforma inteligente de descoberta de promoções com IA**

![InfoHub](https://img.shields.io/badge/InfoHub-Backend-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![AI](https://img.shields.io/badge/AI-Ollama%20Phi3-purple)

## 📋 Sobre o Projeto

O **InfoHub** é uma plataforma completa que combina **Node.js**, **Python** e **Inteligência Artificial** para oferecer a melhor experiência em descoberta de promoções. O sistema utiliza processamento de linguagem natural para entender pedidos dos usuários e retorna promoções reais baseadas em localização e preços.

### 🎯 **Principais Funcionalidades**

- 🤖 **Assistente IA Real** com Ollama + Phi3:mini
- 📍 **Busca por Localização** (cálculo de distância automático)
- 💰 **Comparação de Preços** em tempo real
- 🛍️ **Catálogo Completo** de produtos e estabelecimentos
- 🔐 **Sistema de Autenticação** JWT
- 📧 **Recuperação de Senha** por email
- 🗄️ **Banco de Dados MySQL** com Prisma ORM

---

## 🏗️ Arquitetura do Sistema

```
📦 InfoHub Backend
├── 🌐 API REST (Node.js + Express)
├── 🤖 Agente IA (Python + Ollama)
├── 🗄️ Banco de Dados (MySQL + Prisma)
└── 🔒 Autenticação (JWT + bcrypt)
```

### **Fluxo de Funcionamento:**

1. **Cliente** → envia mensagem para API REST
2. **Node.js** → processa e consulta banco de dados
3. **Python IA** → interpreta linguagem natural
4. **Ollama** → gera resposta personalizada
5. **Sistema** → retorna promoções ordenadas por preço/distância

---

## 🚀 Tecnologias Utilizadas

### **Backend Core**
- **Node.js** 20.x - Runtime principal
- **Express** 4.x - Framework web
- **Prisma** 5.x - ORM para banco de dados
- **MySQL** 8.0 - Banco de dados relacional

### **Inteligência Artificial**
- **Python** 3.11 - Processamento IA
- **Ollama** - Runtime de modelos LLM
- **Phi3:mini** - Modelo de linguagem (2.2GB)
- **FastAPI** - API Python para IA

### **Segurança & Autenticação**
- **JWT** - Tokens de autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Configuração de origem cruzada

### **Utilitários**
- **Nodemailer** - Envio de emails
- **node-fetch** - Requisições HTTP

---

## 📁 Estrutura do Projeto

```
INFOHUB---BACKEND/
│
├── 📂 controller/           # Controladores da API
│   ├── chatIA/
│   │   └── agenteController.js    # Controle do agente IA
│   ├── recuperarSenha/
│   │   └── controllerRecuperarSenha.js
│   └── usuario/
│       └── controllerUsuario.js   # CRUD de usuários
│
├── 📂 python_agents/       # Sistema de IA Python
│   ├── agente_real.py      # Agente principal com Ollama
│   ├── server.py          # Servidor FastAPI
│   ├── config.py          # Configurações e system message
│   ├── tools.py           # Ferramentas (busca promoções)
│   ├── database.py        # Conexão MySQL Python
│   ├── memory.py          # Sistema de memória de conversas
│   └── run_stable.py      # Inicializador do servidor
│
├── 📂 model/               # Modelos de dados
│   └── DAO/
│       ├── agente.js      # Data access para agente
│       ├── recuperacaoSenha.js
│       └── usuario.js     # Data access usuários
│
├── 📂 services/            # Serviços externos
│   ├── agentePythonService.js  # Interface Node ↔ Python
│   └── emailService.js    # Envio de emails
│
├── 📂 route/               # Rotas da API
│   └── routes.js          # Definição de endpoints
│
├── 📂 middleware/          # Middlewares
│   └── verificarToken.js  # Validação JWT
│
├── 📂 modulo/              # Configurações
│   └── config.js          # Config banco e sistema
│
├── 📂 database/            # Schemas e migrations
│   └── dbinfohub.sql      # Schema do banco
│
├── 📂 prisma/              # Configuração Prisma
│   └── schema.prisma      # Modelo do banco
│
├── 📄 app.js               # Servidor principal
└── 📄 package.json         # Dependências Node.js
```

---

## ⚙️ Configuração e Instalação

### **📋 Pré-requisitos**

- Node.js 20.x ou superior
- Python 3.11 ou superior
- MySQL 8.0 ou superior
- Ollama instalado

### **🔧 Instalação**

1. **Clone o repositório:**
```bash
git clone https://github.com/R4elDev/INFOHUB---BACKEND.git
cd INFOHUB---BACKEND
```

2. **Instale dependências Node.js:**
```bash
npm install
```

3. **Configure o banco de dados:**
```bash
# Configure as variáveis no arquivo .env
npx prisma migrate dev
```

4. **Instale dependências Python:**
```bash
cd python_agents
pip install -r requirements.txt
```

5. **Instale e configure Ollama:**
```bash
# Instale o Ollama
ollama pull phi3:mini
```

---

## 🚀 Como Executar

### **Desenvolvimento (2 servidores)**

1. **Terminal 1 - Servidor Node.js:**
```bash
node app.js
# 🌐 API rodando em: http://localhost:8080
```

2. **Terminal 2 - Agente Python:**
```bash
cd python_agents
python run_stable.py
# 🤖 IA rodando em: http://localhost:5001
```

### **Verificação:**
```bash
# Teste a API
curl http://localhost:8080/v1/infohub/usuarios

# Teste o agente IA
curl -X POST http://localhost:5001/ollama \
  -H "Content-Type: application/json" \
  -d '{"mensagem":"quero promoções de leite","idUsuario":1}'
```

---

## 📡 Endpoints da API

### **👤 Usuários**
```
GET    /v1/infohub/usuarios              # Listar usuários
POST   /v1/infohub/usuarios              # Criar usuário
PUT    /v1/infohub/usuarios/:id          # Atualizar usuário
DELETE /v1/infohub/usuarios/:id          # Deletar usuário
POST   /v1/infohub/login                 # Login usuário
```

### **🔐 Autenticação**
```
POST   /v1/infohub/recuperar-senha       # Solicitar recuperação
POST   /v1/infohub/redefinir-senha       # Redefinir senha
```

### **🤖 Agente IA**
```
POST   /v1/infohub/interagir             # Conversar com IA
```

**Exemplo de uso do agente:**
```javascript
// Requisição
POST /v1/infohub/interagir
{
  "mensagem": "quero promoções de leite",
  "idUsuario": 1
}

// Resposta
{
  "resposta": "🛒 Encontrei 3 promoção(ões) para leite!\n\n• Leite Integral - Supermercado Central\n  💰 R$ 4,99 - 📍 2.6 km - 📅 até 2025-10-31",
  "toolsUsed": ["best_promotions"],
  "status": "success"
}
```

---

## 🤖 Sistema de IA

### **Características do Agente:**

- 🧠 **Modelo:** Phi3:mini (2.2GB) - Otimizado para eficiência
- 💬 **Linguagem Natural:** Entende português brasileiro
- 🔧 **Ferramentas:** Acesso ao banco de dados real
- 📍 **Contextual:** Considera localização do usuário
- 💾 **Memória:** Mantém contexto da conversa

### **Exemplos de Conversação:**

| Entrada do Usuário | Resposta do Agente |
|-------------------|------------------|
| `"quero leite barato"` | Lista promoções reais ordenadas por preço |
| `"como funciona o InfoHub?"` | Explica funcionamento da plataforma |
| `"que produtos vocês têm?"` | Lista categorias disponíveis |
| `"me fale sobre política"` | Redireciona educadamente para promoções |

---

## 🗄️ Banco de Dados

### **Principais Tabelas:**

- **👤 tbl_usuario** - Dados dos usuários
- **📍 tbl_enderecoUsuario** - Endereços para cálculo de distância
- **🛍️ tbl_produto** - Catálogo de produtos
- **🏪 tbl_estabelecimento** - Lojas e supermercados
- **💰 tbl_promocao** - Ofertas ativas
- **📍 tbl_enderecoEstabelecimento** - Localização das lojas

### **Relacionamentos Principais:**
```sql
Usuario 1→N EnderecoUsuario
Estabelecimento 1→N EnderecoEstabelecimento  
Produto N→M Estabelecimento (através de Promocao)
```

---

## 🔒 Segurança

- **🔐 Autenticação JWT** - Tokens seguros
- **🔒 Hash bcrypt** - Senhas criptografadas (salt rounds: 12)
- **🛡️ Middleware de Validação** - Verificação de tokens
- **🚫 CORS Configurado** - Proteção contra requisições maliciosas
- **✅ Sanitização** - Validação de dados de entrada

---

## 🧪 Testes

```bash
# Testar agente IA localmente
cd python_agents
python -c "from agente_real import fallback_response; print(fallback_response('quero leite', [], 1))"

# Testar API completa
curl -X POST http://localhost:8080/v1/infohub/interagir \
  -H "Content-Type: application/json" \
  -d '{"mensagem":"oi","idUsuario":1}'
```

---

## 📦 Deploy

### **Produção recomendada:**

1. **Node.js:** PM2 ou Docker
2. **Python:** Gunicorn + supervisord
3. **Banco:** MySQL 8.0 com backup automático
4. **Ollama:** Servidor dedicado ou GPU

### **Exemplo Docker:**
```dockerfile
# Dockerfile Node.js
FROM node:20-alpine
COPY . /app
WORKDIR /app
RUN npm install --production
EXPOSE 8080
CMD ["node", "app.js"]
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

**R4elDev** - [GitHub](https://github.com/R4elDev)

---

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@infohub.com
- 💬 Issues: [GitHub Issues](https://github.com/R4elDev/INFOHUB---BACKEND/issues)

---

*Feito com 💜 e muito ☕ pela equipe InfoHub*
