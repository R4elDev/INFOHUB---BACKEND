// Serviço para consumir a API do Groq
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Defina sua chave de API Groq no .env

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0,8) + '...' : 'undefined');

async function perguntarGroq(mensagem, contexto = '') {
  try {
    // System message melhorado para o InfoHub
    const systemMessage = `Você é o assistente de produtos do InfoHub 😊

🔒 REGRA FUNDAMENTAL (OBRIGATÓRIA):
- Você DEVE responder APENAS com base nas informações do CONTEXTO fornecido abaixo.
- Se a informação NÃO estiver no contexto, diga: "Não encontrei essa informação no catálogo."
- NUNCA invente, suponha ou crie dados que não estejam explicitamente no contexto.

📊 CONTEXTO DO CATÁLOGO:
${contexto}

FORMATO DE RESPOSTA:
- Seja simpático, direto e objetivo.
- Use APENAS os dados do contexto acima.
- Formate valores monetários como: R$ 12,50.
- Cite sempre os dados exatos do contexto (nomes, preços, descontos, datas, etc.).

COMPORTAMENTO:
- Foque SOMENTE em produtos e suas informações (preço, categoria, promoção).
- Se perguntarem sobre promoções: mostre apenas produtos que têm "EM PROMOÇÃO" no contexto.
- Se perguntarem por categoria: filtre pelos produtos dessa categoria no contexto.
- Para saudações simples ("olá", "oi"): responda apenas "Olá! Posso te ajudar a encontrar produtos?" SEM listar nada.

❌ NUNCA FAÇA:
- Inventar produtos, preços ou dados que não estão no contexto
- Falar sobre usuários, clientes ou dados pessoais
- Supor informações não fornecidas
- Criar estatísticas além das presentes no contexto

Siga essas regras RIGOROSAMENTE.`;




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
