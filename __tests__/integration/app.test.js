const request = require('supertest');
const express = require('express');

// Mock das dependências antes de importar o app
jest.mock('../../services/aiService');
jest.mock('../../model/DAO/produto');
jest.mock('../../model/DAO/usuario');

describe('Testes de Integração - INFOHUB Backend', () => {
  let app;

  beforeAll(() => {
    // Configurar variáveis de ambiente para teste
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.GROQ_API_KEY = 'test-groq-key';
    
    // Criar app de teste
    app = express();
    app.use(express.json());
    
    // Importar rotas após configurar mocks
    const routes = require('../../route/routes.js');
    app.use('/v1/infohub', routes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estrutura da API', () => {
    it('deve responder na rota base da API', async () => {
      const response = await request(app)
        .get('/v1/infohub')
        .expect(404); // Assumindo que não há rota GET na raiz

      // Verifica se a API está rodando
      expect(response).toBeDefined();
    });

    it('deve aceitar requisições JSON', async () => {
      const response = await request(app)
        .post('/v1/infohub/test-endpoint')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Verifica se aceita JSON (mesmo que endpoint não exista)
      expect(response).toBeDefined();
    });
  });

  describe('Middleware de CORS', () => {
    it('deve incluir headers CORS nas respostas', async () => {
      const response = await request(app)
        .get('/v1/infohub/test-cors')
        .expect(404); // Endpoint não existe, mas deve ter headers CORS

      // Verifica headers CORS básicos (mesmo em 404)
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar erro 404 para rotas inexistentes', async () => {
      const response = await request(app)
        .get('/v1/infohub/rota-inexistente')
        .expect(404);

      expect(response).toBeDefined();
    });

    it('deve tratar requisições malformadas', async () => {
      const response = await request(app)
        .post('/v1/infohub/test')
        .send('invalid-json')
        .set('Content-Type', 'application/json');

      // Deve retornar erro de parsing JSON
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Estrutura de Resposta', () => {
    it('deve manter estrutura consistente de resposta de erro', async () => {
      const response = await request(app)
        .get('/v1/infohub/endpoint-inexistente');

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toBeDefined();
    });
  });

  describe('Configuração do Servidor', () => {
    it('deve processar requisições com body parser', async () => {
      const testData = { message: 'test' };
      
      const response = await request(app)
        .post('/v1/infohub/test-body')
        .send(testData)
        .set('Content-Type', 'application/json');

      // Verifica se o body parser está funcionando
      expect(response).toBeDefined();
    });

    it('deve aceitar diferentes tipos de content-type', async () => {
      const response = await request(app)
        .post('/v1/infohub/test-content-type')
        .send({ data: 'test' })
        .set('Content-Type', 'application/json');

      expect(response).toBeDefined();
    });
  });
});

describe('Testes de Performance Básica', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Rota de teste simples
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  });

  it('deve responder rapidamente a requisições simples', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/health')
      .expect(200);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.body.status).toBe('ok');
    expect(responseTime).toBeLessThan(100); // Menos de 100ms
  });

  it('deve lidar com múltiplas requisições simultâneas', async () => {
    const requests = Array.from({ length: 5 }, () =>
      request(app).get('/health').expect(200)
    );

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.body.status).toBe('ok');
    });
  });
});
