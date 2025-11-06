// Helpers para testes
const jwt = require('jsonwebtoken');

/**
 * Gera um token JWT válido para testes
 * @param {Object} payload - Dados do usuário
 * @param {string} secret - Chave secreta (opcional)
 * @returns {string} Token JWT
 */
const generateTestToken = (payload = { id: 1, nome: 'Test User' }, secret = 'test-jwt-secret') => {
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

/**
 * Gera um token JWT expirado para testes
 * @param {Object} payload - Dados do usuário
 * @param {string} secret - Chave secreta (opcional)
 * @returns {string} Token JWT expirado
 */
const generateExpiredToken = (payload = { id: 1, nome: 'Test User' }, secret = 'test-jwt-secret') => {
  return jwt.sign(payload, secret, { expiresIn: '-1h' });
};

/**
 * Cria um mock de request para testes
 * @param {Object} options - Opções do request
 * @returns {Object} Mock request object
 */
const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    ...options
  };
};

/**
 * Cria um mock de response para testes
 * @returns {Object} Mock response object
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Dados de teste para usuários
 */
const testUsers = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    perfil: 'admin'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@example.com',
    perfil: 'user'
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro@example.com',
    perfil: 'user'
  }
];

/**
 * Dados de teste para produtos
 */
const testProducts = [
  {
    id: 1,
    nome: 'Notebook Dell',
    preco: 2500.00,
    categoria: 'Eletrônicos'
  },
  {
    id: 2,
    nome: 'Mouse Logitech',
    preco: 89.90,
    categoria: 'Periféricos'
  },
  {
    id: 3,
    nome: 'Teclado Mecânico',
    preco: 299.99,
    categoria: 'Periféricos'
  }
];

/**
 * Configurações de teste padrão
 */
const testConfig = {
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h'
  },
  email: {
    user: 'test@example.com',
    pass: 'test-password'
  },
  groq: {
    apiKey: 'test-groq-key'
  }
};

/**
 * Simula delay para testes assíncronos
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise} Promise que resolve após o delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Valida estrutura de resposta da API
 * @param {Object} response - Resposta da API
 * @param {Array} requiredFields - Campos obrigatórios
 * @returns {boolean} True se válida
 */
const validateApiResponse = (response, requiredFields = []) => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return requiredFields.every(field => 
    response.hasOwnProperty(field)
  );
};

module.exports = {
  generateTestToken,
  generateExpiredToken,
  createMockRequest,
  createMockResponse,
  testUsers,
  testProducts,
  testConfig,
  delay,
  validateApiResponse
};
