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
  
  // Timeout para testes (aumentado para testes de banco)
  testTimeout: 30000,
  
  // Máximo de workers paralelos (reduz para evitar sobrecarga)
  maxWorkers: 2,
  
  // Execução sequencial para testes de banco
  runInBand: true,
  
  // Configuração para mocks
  clearMocks: true,
  restoreMocks: true
};
