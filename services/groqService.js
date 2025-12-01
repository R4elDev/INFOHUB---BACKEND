// Serviço para consumir a API do Groq
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Defina sua chave de API Groq no .env

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0,8) + '...' : 'undefined');

async function perguntarGroq(mensagem, contexto = '') {
  try {
    // System message melhorado para o InfoHub
    const systemMessage = `Você é o assistente do InfoHub 😊

PRINCIPAIS:
- Responda de forma simpática, direta e útil. Use poucas frases.
- Use apenas as informações presentes no CONTEXTO (${contexto}).
- Não invente dados nem regras.

COMPORTAMENTO IMPORTANTE:
- NÃO apresente resumos ou estatísticas automaticamente quando o usuário apenas disser "olá" ou não pedir. 
- Só mostre um resumo geral se:
  1) o usuário pedir "Me mostre um resumo" / "Resumo do sistema" (ou similar),
- Ao exibir contagens ou valores, apresente-os de forma neutra, ex.: "Total de usuários: 1" (NÃO: "1 (você)" ou "apenas 1 usuário").

FORMATO E TOM:
- Seja simpático e direto. Máx. 2–3 frases por resposta, a menos que solicitado.
- Formate valores monetários como: R$ 12,50.
- Se faltar informação no contexto, responda gentilmente: "Não há informação no contexto sobre <campo>."


EXEMPLOS:
- Usuário: "olá" -> Resposta esperada: "Olá! Como posso ajudar?" (sem resumo).
- Usuário: "Me dê um resumo" + contexto com totals -> Mostre resumo simples: "Resumo: Total de usuários: 1. Total de produtos: 0."

Siga essas regras estritamente.`;




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
