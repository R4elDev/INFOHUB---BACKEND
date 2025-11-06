const { perguntarGroq } = require('../../services/groqService');
const axios = require('axios');

// Mock do axios
jest.mock('axios');
const mockedAxios = axios;

describe('GroqService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar variável de ambiente para teste
    process.env.GROQ_API_KEY = 'test-groq-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('perguntarGroq', () => {
    it('deve retornar resposta da API Groq com sucesso', async () => {
      // Arrange
      const mensagem = 'Quantos produtos temos?';
      const contexto = 'Total de produtos: 10';
      const respostaEsperada = 'Você tem 10 produtos cadastrados no sistema.';

      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: respostaEsperada
              }
            }
          ]
        }
      });

      // Act
      const resultado = await perguntarGroq(mensagem, contexto);

      // Assert
      expect(resultado).toBe(respostaEsperada);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          model: 'llama-3.1-8b-instant',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user', content: mensagem })
          ])
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-groq-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('deve funcionar sem contexto', async () => {
      // Arrange
      const mensagem = 'Olá!';
      const respostaEsperada = 'Olá! Como posso ajudá-lo?';

      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: respostaEsperada
              }
            }
          ]
        }
      });

      // Act
      const resultado = await perguntarGroq(mensagem);

      // Assert
      expect(resultado).toBe(respostaEsperada);
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('deve lançar erro quando API Groq falha', async () => {
      // Arrange
      const mensagem = 'Teste erro';
      const erroAPI = {
        response: {
          data: { error: 'API Error' }
        }
      };

      mockedAxios.post.mockRejectedValue(erroAPI);

      // Act & Assert
      await expect(perguntarGroq(mensagem)).rejects.toThrow('Erro ao consultar Groq');
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('deve lançar erro quando não há chave de API', async () => {
      // Arrange
      delete process.env.GROQ_API_KEY;
      const mensagem = 'Teste sem chave';

      mockedAxios.post.mockRejectedValue(new Error('Unauthorized'));

      // Act & Assert
      await expect(perguntarGroq(mensagem)).rejects.toThrow('Erro ao consultar Groq');
    });

    it('deve incluir contexto na mensagem do sistema', async () => {
      // Arrange
      const mensagem = 'Teste';
      const contexto = 'Dados importantes: 123';

      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Resposta' } }]
        }
      });

      // Act
      await perguntarGroq(mensagem, contexto);

      // Assert
      const chamada = mockedAxios.post.mock.calls[0];
      const systemMessage = chamada[1].messages[0].content;
      expect(systemMessage).toContain(contexto);
    });
  });
});
