// Serviço para consumir a API do Groq
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Defina sua chave de API Groq no .env

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0,8) + '...' : 'undefined');

async function perguntarGroq(mensagem, contexto = '') {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Modelo de produção atual do Groq (substitui llama3-70b-8192)
        messages: [
          { role: 'system', content: contexto },
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
