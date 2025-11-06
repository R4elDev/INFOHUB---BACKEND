const { interpretarPergunta } = require('../../controller/chatIA/groqController');
const { perguntarIA } = require('../../services/aiService');
const Produto = require('../../model/DAO/produto');
const Usuario = require('../../model/DAO/usuario');

// Mocks
jest.mock('../../services/aiService');
jest.mock('../../model/DAO/produto');
jest.mock('../../model/DAO/usuario');

describe('GroqController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('interpretarPergunta', () => {
    it('deve retornar erro 400 quando pergunta não é fornecida', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        erro: 'Pergunta é obrigatória'
      });
    });

    it('deve buscar dados de usuários quando pergunta menciona usuários', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Quantos usuários temos cadastrados?' };
      
      const mockUsuarios = [
        { nome: 'João', perfil: 'admin' },
        { nome: 'Maria', perfil: 'user' }
      ];

      Usuario.selectAllUsuario.mockResolvedValue(mockUsuarios);
      perguntarIA.mockResolvedValue({
        resposta: 'Você tem 2 usuários cadastrados.',
        fonte: 'groq',
        tempo_resposta: '1.2s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(Usuario.selectAllUsuario).toHaveBeenCalled();
      expect(perguntarIA).toHaveBeenCalledWith(
        'Quantos usuários temos cadastrados?',
        expect.stringContaining('Total de usuários cadastrados: 2')
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        resposta: 'Você tem 2 usuários cadastrados.',
        fonte: 'groq',
        tempo_resposta: '1.2s'
      });
    });

    it('deve buscar dados de produtos quando pergunta menciona produtos', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Quais produtos estão em promoção?' };
      
      const mockProdutos = [
        { nome: 'Notebook' },
        { nome: 'Mouse' },
        { nome: 'Teclado' }
      ];

      Produto.selectAllProdutos.mockResolvedValue(mockProdutos);
      perguntarIA.mockResolvedValue({
        resposta: 'Temos 3 produtos disponíveis.',
        fonte: 'groq',
        tempo_resposta: '0.8s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(Produto.selectAllProdutos).toHaveBeenCalled();
      expect(perguntarIA).toHaveBeenCalledWith(
        'Quais produtos estão em promoção?',
        expect.stringContaining('Total de produtos: 3')
      );
    });

    it('deve buscar dados gerais quando pergunta não é específica', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Como está o sistema?' };
      
      Usuario.selectAllUsuario.mockResolvedValue([{ nome: 'João' }]);
      Produto.selectAllProdutos.mockResolvedValue([{ nome: 'Produto1' }, { nome: 'Produto2' }]);
      perguntarIA.mockResolvedValue({
        resposta: 'O sistema está funcionando bem.',
        fonte: 'groq',
        tempo_resposta: '1.0s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(Usuario.selectAllUsuario).toHaveBeenCalled();
      expect(Produto.selectAllProdutos).toHaveBeenCalled();
      expect(perguntarIA).toHaveBeenCalledWith(
        'Como está o sistema?',
        expect.stringContaining('Total de usuários: 1')
      );
    });

    it('deve incluir detalhes dos usuários quando há poucos usuários', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Quem são os usuários?' };
      
      const mockUsuarios = [
        { nome: 'João', perfil: 'admin' },
        { nome: 'Maria', perfil: 'user' }
      ];

      Usuario.selectAllUsuario.mockResolvedValue(mockUsuarios);
      perguntarIA.mockResolvedValue({
        resposta: 'Os usuários são João e Maria.',
        fonte: 'groq',
        tempo_resposta: '0.9s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(perguntarIA).toHaveBeenCalledWith(
        'Quem são os usuários?',
        expect.stringContaining('Usuários: João (admin), Maria (user)')
      );
    });

    it('deve não incluir detalhes quando há muitos usuários', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Quantos usuários temos?' };
      
      // Criar array com mais de 10 usuários
      const mockUsuarios = Array.from({ length: 15 }, (_, i) => ({
        nome: `Usuario${i}`,
        perfil: 'user'
      }));

      Usuario.selectAllUsuario.mockResolvedValue(mockUsuarios);
      perguntarIA.mockResolvedValue({
        resposta: 'Você tem 15 usuários cadastrados.',
        fonte: 'groq',
        tempo_resposta: '1.1s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      const contextoUsado = perguntarIA.mock.calls[0][1];
      expect(contextoUsado).toContain('Total de usuários cadastrados: 15');
      expect(contextoUsado).not.toContain('Usuários:');
    });

    it('deve tratar erro 500 quando serviço falha', async () => {
      // Arrange
      mockReq.body = { pergunta: 'Teste erro' };
      
      const erro = new Error('Erro no serviço');
      perguntarIA.mockRejectedValue(erro);

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        erro: 'Erro no serviço'
      });
    });

    it('deve reconhecer diferentes variações de palavras-chave', async () => {
      // Arrange - teste com acentos
      mockReq.body = { pergunta: 'Quantos usuários estão cadastrados?' };
      
      Usuario.selectAllUsuario.mockResolvedValue([]);
      perguntarIA.mockResolvedValue({
        resposta: 'Não há usuários cadastrados.',
        fonte: 'groq',
        tempo_resposta: '0.5s'
      });

      // Act
      await interpretarPergunta(mockReq, mockRes);

      // Assert
      expect(Usuario.selectAllUsuario).toHaveBeenCalled();
    });
  });
});
