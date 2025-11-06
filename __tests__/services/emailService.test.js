const { enviarEmailDeRecuperacao } = require('../../services/emailService');

// Mock do nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

describe('EmailService', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar variáveis de ambiente para teste
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password';

    // Mock do transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    };

    nodemailer.createTransporter.mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('enviarEmailDeRecuperacao', () => {
    it('deve enviar email de recuperação com sucesso', async () => {
      // Arrange
      const destinatario = 'usuario@example.com';
      const codigo = '123456';

      // Act
      await enviarEmailDeRecuperacao(destinatario, codigo);

      // Assert
      expect(nodemailer.createTransporter).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@example.com',
          pass: 'test-password'
        }
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Suporte -->" <test@example.com>',
        to: destinatario,
        subject: 'Recuperação de Senha',
        text: `Seu código de recuperação é: ${codigo} (válido por 15 minutos).`
      });
    });

    it('deve usar as variáveis de ambiente corretas', async () => {
      // Arrange
      process.env.EMAIL_USER = 'custom@email.com';
      process.env.EMAIL_PASS = 'custom-password';
      
      const destinatario = 'test@example.com';
      const codigo = '789012';

      // Act
      await enviarEmailDeRecuperacao(destinatario, codigo);

      // Assert
      expect(nodemailer.createTransporter).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'custom@email.com',
          pass: 'custom-password'
        }
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Suporte -->" <custom@email.com>',
          to: destinatario
        })
      );
    });

    it('deve incluir o código correto no texto do email', async () => {
      // Arrange
      const destinatario = 'test@example.com';
      const codigo = 'ABC123';

      // Act
      await enviarEmailDeRecuperacao(destinatario, codigo);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Seu código de recuperação é: ABC123 (válido por 15 minutos).'
        })
      );
    });

    it('deve propagar erro quando sendMail falha', async () => {
      // Arrange
      const destinatario = 'test@example.com';
      const codigo = '123456';
      const erro = new Error('Falha no envio de email');

      mockTransporter.sendMail.mockRejectedValue(erro);

      // Act & Assert
      await expect(enviarEmailDeRecuperacao(destinatario, codigo))
        .rejects.toThrow('Falha no envio de email');
    });

    it('deve propagar erro quando createTransporter falha', async () => {
      // Arrange
      const destinatario = 'test@example.com';
      const codigo = '123456';
      const erro = new Error('Falha na configuração do transporter');

      nodemailer.createTransporter.mockImplementation(() => {
        throw erro;
      });

      // Act & Assert
      await expect(enviarEmailDeRecuperacao(destinatario, codigo))
        .rejects.toThrow('Falha na configuração do transporter');
    });
  });
});
