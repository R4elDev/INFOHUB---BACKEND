module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Padrão de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Configuração de cobertura
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    'model/**/*.js',
    '!**/node_modules/**',
    '!coverage/**'
  ],
  
  // Configuração para variáveis de ambiente de teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configuração para mocks
  clearMocks: true,
  restoreMocks: true
};
