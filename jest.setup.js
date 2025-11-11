// Configuração global para testes
require('dotenv').config({ path: '.env.test' });

// Configurações globais para testes
global.console = {
  ...console,
  // Silenciar logs durante os testes (opcional)
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configuração de timeout para testes assíncronos (aumentado para testes de banco)
jest.setTimeout(30000);

// Configuração global de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';

// Desabilitar logs desnecessários durante os testes
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: process.env.JEST_VERBOSE === 'true' ? originalConsole.log : jest.fn(),
  info: process.env.JEST_VERBOSE === 'true' ? originalConsole.info : jest.fn(),
  debug: jest.fn(),
};

// Configuração para evitar warnings de timeout
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';
