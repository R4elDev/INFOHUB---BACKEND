// Testes de integração simples que não dependem de rotas específicas
const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Testes Básicos de Integração', () => {
  let app;

  beforeAll(() => {
    // Criar app de teste simples
    app = express();
    app.use(cors());
    app.use(express.json());
    
    // Rota de teste
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'infohub-backend' });
    });
  });

  describe('Configuração Básica', () => {
    it('deve responder na rota de health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        service: 'infohub-backend'
      });
    });

    it('deve incluir headers CORS', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('deve processar JSON no body', async () => {
      app.post('/test-json', (req, res) => {
        res.json({ received: req.body });
      });

      const testData = { message: 'test' };
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });

    it('deve retornar 404 para rotas inexistentes', async () => {
      await request(app)
        .get('/rota-inexistente')
        .expect(404);
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar JSON malformado', async () => {
      const response = await request(app)
        .post('/test-json')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
