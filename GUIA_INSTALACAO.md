# 🚀 **Guia de Instalação - Sistema E-commerce InfoHub**

## 📋 **Pré-requisitos**

- ✅ Node.js v14 ou superior
- ✅ MySQL 8.0 ou superior
- ✅ NPM ou Yarn

---

## ⚡ **Instalação Rápida**

### **1. Clonar e Instalar Dependências**
```bash
# Navegar para o diretório do projeto
cd "c:\Users\24122293\Documents\INFOHUB-BACKBACK\INFOHUB---BACKEND"

# Instalar dependências
npm install
```

### **2. Configurar Banco de Dados**

#### **2.1 Executar Scripts SQL**
Execute os scripts na seguinte ordem:

```sql
-- 1. Script principal (se ainda não executado)
SOURCE database/setup_completo.sql;

-- 2. Novo script com tabelas do e-commerce
SOURCE database/novas_tabelas_carrinho_compras.sql;
```

#### **2.2 Sincronizar Prisma**
```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações (se necessário)
npx prisma migrate dev

# Visualizar banco (opcional)
npx prisma studio
```

### **3. Configurar Variáveis de Ambiente**
Verifique se o arquivo de configuração está correto:

```javascript
// modulo/config.js
const config = {
  database: {
    host: 'localhost',
    user: 'seu_usuario_mysql',
    password: 'sua_senha_mysql',
    database: 'dbinfohub'
  },
  jwt: {
    secret: 'sua_chave_secreta_jwt'
  },
  email: {
    // Configurações do email se necessário
  }
}
```

---

## 🧪 **Testando o Sistema**

### **1. Iniciar o Servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### **2. Executar Testes**
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern=carrinho
npm test -- --testPathPattern=compra
```

### **3. Teste Manual das APIs**

#### **3.1 Autenticação**
```bash
# Login para obter token
curl -X POST http://localhost:8080/v1/infohub/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teste.com", "senha": "123456"}'
```

#### **3.2 Testar Carrinho**
```bash
# Adicionar ao carrinho (substitua <TOKEN> pelo token obtido)
curl -X POST http://localhost:8080/v1/infohub/carrinho \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id_usuario": 1, "id_produto": 1, "quantidade": 2}'

# Ver carrinho
curl -X GET http://localhost:8080/v1/infohub/carrinho/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔄 **Configuração de Desenvolvimento**

### **1. Scripts Úteis**
Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "npx prisma generate",
    "prisma:studio": "npx prisma studio",
    "db:seed": "node database/seed.js"
  }
}
```

### **2. Dados de Teste**
Execute para inserir dados de exemplo:

```bash
# Se você tiver o arquivo de seed
node database/dados_teste.sql
```

### **3. Monitoramento**
Para desenvolvimento, use:

```bash
# Ver logs em tempo real
npm run dev

# Em outro terminal, monitorar banco
npx prisma studio
```

---

## 🛡️ **Configuração de Segurança**

### **1. JWT Configuration**
```javascript
// Em modulo/config.js
const jwt_secret = process.env.JWT_SECRET || 'sua_chave_super_secreta';
const jwt_expires = '24h'; // ou '7d' para desenvolvimento
```

### **2. CORS (se necessário)**
```javascript
// Em app.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

### **3. Rate Limiting (recomendado)**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

app.use('/v1/infohub', limiter);
```

---

## 📊 **Monitoramento e Logs**

### **1. Logs de Sistema**
Instalar Winston para logs mais robustos:

```bash
npm install winston
```

### **2. Métricas de Performance**
```bash
# Instalar PM2 para produção
npm install -g pm2

# Iniciar com PM2
pm2 start app.js --name "infohub-api"

# Monitorar
pm2 monit
```

---

## 🎯 **Funcionalidades Principais Implementadas**

### ✅ **Sistema de Carrinho**
- Adicionar/remover itens
- Calcular totais com promoções
- Persistência entre sessões

### ✅ **Sistema de Compras**
- Processamento completo
- Múltiplos status de pedido
- Histórico de compras

### ✅ **Sistema de Favoritos**
- Lista de desejos
- Notificações de promoção
- Estatísticas de popularidade

### ✅ **Sistema de Notificações**
- Notificações automáticas
- Diferentes tipos de alerta
- Controle de lidas/não lidas

### ✅ **Sistema de Avaliações**
- Avaliações de produtos
- Avaliações de estabelecimentos
- Estatísticas e rankings

### ✅ **Controle de Permissões**
- Usuários, Admins, Estabelecimentos
- Middleware de segurança
- Validação de acesso

---

## 🚨 **Troubleshooting**

### **Erro: "Cannot find module 'prisma'"**
```bash
npm install prisma @prisma/client
npx prisma generate
```

### **Erro: "Database connection failed"**
1. Verifique se MySQL está rodando
2. Confirme credenciais em `config.js`
3. Teste conexão manual

### **Erro: "JWT malformed"**
1. Verifique se token está sendo enviado corretamente
2. Confirme formato: `Authorization: Bearer <TOKEN>`
3. Verifique se secret está configurado

### **Erro: "Table doesn't exist"**
```bash
# Execute os scripts SQL na ordem correta
mysql -u root -p dbinfohub < database/setup_completo.sql
mysql -u root -p dbinfohub < database/novas_tabelas_carrinho_compras.sql
```

---

## 📈 **Próximos Passos**

### **Melhorias Sugeridas**
1. 🔄 **Cache Redis** - Para melhor performance
2. 📱 **WebSocket** - Notificações em tempo real
3. 📧 **Email Templates** - Notificações por email
4. 💳 **Gateway de Pagamento** - Integração real
5. 📊 **Analytics** - Métricas de uso
6. 🔍 **Elasticsearch** - Busca avançada
7. 🐳 **Docker** - Containerização
8. ☁️ **Cloud Deploy** - Deploy automatizado

### **Integrações Possíveis**
- **WhatsApp API** - Notificações por WhatsApp
- **FCM/Push** - Notificações push mobile
- **AWS S3** - Upload de imagens
- **Stripe/PagSeguro** - Pagamentos reais
- **Correios API** - Cálculo de frete

---

## 🎉 **Sistema Pronto!**

Seu backend InfoHub agora possui:
- ✅ **E-commerce completo** funcionando
- ✅ **API RESTful** bem estruturada  
- ✅ **Segurança robusta** implementada
- ✅ **Documentação completa** disponível
- ✅ **Testes automatizados** funcionando
- ✅ **Arquitetura escalável** preparada

**Para usar:** Siga os passos de instalação, execute os scripts SQL, inicie o servidor e comece a testar as APIs! 🚀