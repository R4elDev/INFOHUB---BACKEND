// Serviço para consumir a API do Groq
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Defina sua chave de API Groq no .env

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0,8) + '...' : 'undefined');

async function perguntarGroq(mensagem, contexto = '') {
  try {
    // System message melhorado para o InfoHub
    const systemMessage = `Você é um assistente inteligente do InfoHub, uma plataforma de promoções e produtos.

SUAS CAPACIDADES:
- Consultar produtos e promoções do banco de dados
- Fornecer informações sobre usuários cadastrados
- Responder perguntas sobre estabelecimentos e categorias
- Ajudar com estatísticas e relatórios do sistema

CONTEXTO DOS DADOS:
${contexto}

INSTRUÇÕES:
- Seja preciso e útil nas respostas
- Use os dados fornecidos no contexto para responder
- Se não tiver informação suficiente, seja claro sobre isso
- Formate números e valores de forma legível (ex: R$ 10,50)
- Para contagens, sempre forneça o número exato`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant', // Modelo mais rápido e com menos consumo de tokens
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: mensagem }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao consultar Groq:', error.response?.data || error.message);
    throw new Error('Erro ao consultar Groq');
  }
}

module.exports = { perguntarGroq };
