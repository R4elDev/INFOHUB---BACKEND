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

// Mock global para Prisma (se necessário)
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    // Adicione outros métodos conforme necessário
  }))
}));

// Configuração de timeout para testes assíncronos
jest.setTimeout(10000);
