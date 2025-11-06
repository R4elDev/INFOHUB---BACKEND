const verificarToken = require('../../middleware/verificarToken');
const jwt = require('jsonwebtoken');

// Mock do jwt
jest.mock('jsonwebtoken');

describe('VerificarToken Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar variável de ambiente
    process.env.JWT_SECRET = 'test-jwt-secret';

    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verificarToken', () => {
    it('deve retornar erro 401 quando token não é fornecido', () => {
      // Arrange
      mockReq.headers = {};

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token não fornecido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando header authorization está vazio', () => {
      // Arrange
      mockReq.headers = {
        authorization: ''
      };

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token não fornecido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando header authorization não tem Bearer', () => {
      // Arrange
      mockReq.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token não fornecido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve validar token com sucesso e chamar next()', () => {
      // Arrange
      const token = 'valid-jwt-token';
      const decodedUser = {
        id: 1,
        nome: 'João',
        email: 'joao@example.com'
      };

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      jwt.verify.mockReturnValue(decodedUser);

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(mockReq.usuario).toEqual(decodedUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('deve retornar erro 401 quando token é inválido', () => {
      // Arrange
      const token = 'invalid-jwt-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockReq.usuario).toBeUndefined();
    });

    it('deve retornar erro 401 quando token está expirado', () => {
      // Arrange
      const token = 'expired-jwt-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expirado');
        error.name = 'TokenExpiredError';
        throw error;
      });

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve funcionar com diferentes formatos de Bearer token', () => {
      // Arrange
      const token = 'another-valid-token';
      const decodedUser = { id: 2, nome: 'Maria' };

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      jwt.verify.mockReturnValue(decodedUser);

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(mockReq.usuario).toEqual(decodedUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve usar a variável de ambiente JWT_SECRET correta', () => {
      // Arrange
      process.env.JWT_SECRET = 'custom-secret-key';
      const token = 'test-token';
      const decodedUser = { id: 3 };

      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      jwt.verify.mockReturnValue(decodedUser);

      // Act
      verificarToken(mockReq, mockRes, mockNext);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'custom-secret-key');
    });
  });
});
