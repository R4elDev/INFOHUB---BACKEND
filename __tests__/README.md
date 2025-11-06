# Testes - INFOHUB Backend

Este diretório contém todos os testes automatizados para o projeto INFOHUB Backend.

## 📁 Estrutura dos Testes

```
__tests__/
├── controllers/          # Testes para controllers
│   └── groqController.test.js
├── services/            # Testes para services
│   ├── groqService.test.js
│   └── emailService.test.js
├── middleware/          # Testes para middleware
│   └── verificarToken.test.js
├── integration/         # Testes de integração
│   └── app.test.js
├── helpers/            # Utilitários para testes
│   └── testHelpers.js
├── example.test.js     # Exemplo de uso dos helpers
└── README.md          # Este arquivo
```

## 🚀 Como Executar os Testes

### Instalar Dependências
```bash
npm install
```

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes em Modo Watch
```bash
npm run test:watch
```

### Executar Testes com Cobertura
```bash
npm run test:coverage
```

### Executar Testes Específicos
```bash
# Executar apenas testes de services
npm test -- __tests__/services

# Executar apenas um arquivo específico
npm test -- __tests__/services/groqService.test.js

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="perguntarGroq"
```

## 🧪 Tipos de Testes

### 1. Testes Unitários
- **Controllers**: Testam a lógica de negócio dos controllers
- **Services**: Testam serviços isoladamente com mocks
- **Middleware**: Testam middleware de autenticação e validação

### 2. Testes de Integração
- **API**: Testam endpoints completos
- **Fluxos**: Testam fluxos completos da aplicação

## 📋 Cobertura de Testes

Os testes cobrem:

### Services
- ✅ `groqService.js` - Integração com API Groq
- ✅ `emailService.js` - Envio de emails de recuperação

### Controllers
- ✅ `groqController.js` - Interpretação de perguntas IA

### Middleware
- ✅ `verificarToken.js` - Validação de tokens JWT

### Integração
- ✅ Estrutura da API
- ✅ Middleware CORS
- ✅ Tratamento de erros
- ✅ Performance básica

## 🛠️ Configuração

### Arquivos de Configuração
- `jest.config.js` - Configuração principal do Jest
- `jest.setup.js` - Setup global para testes
- `.env.test` - Variáveis de ambiente para testes

### Mocks Globais
- `@prisma/client` - Mock do Prisma Client
- `console` - Logs silenciados durante testes

## 📚 Helpers Disponíveis

O arquivo `helpers/testHelpers.js` fornece:

### Autenticação
- `generateTestToken()` - Gera token JWT válido
- `generateExpiredToken()` - Gera token JWT expirado

### Mocks
- `createMockRequest()` - Cria mock de request
- `createMockResponse()` - Cria mock de response

### Dados de Teste
- `testUsers` - Array de usuários para teste
- `testProducts` - Array de produtos para teste
- `testConfig` - Configurações padrão

### Utilitários
- `delay()` - Simula delay assíncrono
- `validateApiResponse()` - Valida estrutura de resposta

## 🎯 Exemplos de Uso

### Teste Básico de Controller
```javascript
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

describe('MeuController', () => {
  it('deve retornar sucesso', async () => {
    const mockReq = createMockRequest({ body: { nome: 'João' } });
    const mockRes = createMockResponse();
    
    await meuController(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
```

### Teste com Autenticação
```javascript
const { generateTestToken } = require('../helpers/testHelpers');

it('deve autenticar usuário', () => {
  const token = generateTestToken({ id: 1, nome: 'João' });
  const mockReq = createMockRequest({
    headers: { authorization: `Bearer ${token}` }
  });
  
  // Teste do middleware ou controller
});
```

## 🔧 Comandos Úteis

### Debug de Testes
```bash
# Executar com logs detalhados
npm test -- --verbose

# Executar apenas testes que falharam
npm test -- --onlyFailures

# Executar com timeout maior
npm test -- --testTimeout=30000
```

### Análise de Cobertura
```bash
# Gerar relatório HTML de cobertura
npm run test:coverage

# Ver cobertura no terminal
npm test -- --coverage --coverageReporters=text
```

## 📈 Métricas de Qualidade

### Objetivos de Cobertura
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Boas Práticas
- ✅ Testes isolados e independentes
- ✅ Mocks apropriados para dependências externas
- ✅ Nomes descritivos para testes
- ✅ Arrange, Act, Assert pattern
- ✅ Testes tanto para casos de sucesso quanto de erro

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Timeout
```bash
# Aumentar timeout global
npm test -- --testTimeout=10000
```

#### Problemas com Mocks
```bash
# Limpar mocks entre testes
jest.clearAllMocks();
```

#### Variáveis de Ambiente
Certifique-se de que o arquivo `.env.test` existe e contém todas as variáveis necessárias.

## 📞 Suporte

Para dúvidas sobre os testes:
1. Consulte este README
2. Veja os exemplos em `example.test.js`
3. Consulte a documentação do Jest: https://jestjs.io/docs/getting-started
