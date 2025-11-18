// ====================================
// 🤖 SERVIÇO DE IA GROQ - DEDICADO
// ====================================
// Sistema que usa exclusivamente Groq API com múltiplos modelos

const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Cache simples para respostas frequentes
const responseCache = new Map();

// Modelos em ordem de prioridade (do mais rápido ao mais robusto)
const MODELS = [
  'llama-3.1-8b-instant',      // Mais rápido, menor consumo
  'mixtral-8x7b-32768',        // Alternativa rápida
  'llama-3.3-70b-versatile'    // Mais poderoso (último recurso)
];

// ====================================
// 🧠 SISTEMA DE IA INTELIGENTE
// ====================================
async function perguntarIA(mensagem, contexto = '') {
  const cacheKey = `${mensagem}_${contexto}`.substring(0, 100);
  
  // 1. Verificar cache primeiro
  if (responseCache.has(cacheKey)) {
    console.log('📋 Resposta do cache');
    return {
      resposta: responseCache.get(cacheKey),
      fonte: 'cache',
      tempo_resposta: '< 1ms'
    };
  }

  // 2. Usar apenas Groq API - tentar todos os modelos
  for (let i = 0; i < MODELS.length; i++) {
    const modelo = MODELS[i];
    
    try {
      console.log(`🤖 Tentando modelo: ${modelo}`);
      const resposta = await tentarGroq(mensagem, contexto, modelo);
      
      // Cache da resposta bem-sucedida
      responseCache.set(cacheKey, resposta);
      
      return {
        resposta,
        fonte: `groq_${modelo}`,
        tempo_resposta: 'real-time'
      };
      
    } catch (error) {
      console.log(`❌ Falha no modelo ${modelo}:`, error.message);
      
      // Se for rate limit, aguardar um pouco antes do próximo modelo
      if (error.message.includes('rate_limit')) {
        console.log('⏳ Rate limit - aguardando 5s...');
        await sleep(5000);
      }
      
      // Se for o último modelo e falhou, lançar erro
      if (i === MODELS.length - 1) {
        throw new Error(`Todos os modelos Groq falharam. Último erro: ${error.message}`);
      }
      
      // Continuar para o próximo modelo
      continue;
    }
  }
}

// ====================================
// 🚀 TENTAR GROQ COM MODELO ESPECÍFICO
// ====================================
async function tentarGroq(mensagem, contexto, modelo) {
  const systemMessage = `Você é um assistente do InfoHub. ${contexto}

INSTRUÇÕES:
- Seja preciso e direto
- Use os dados fornecidos
- Formate números legíveis (ex: R$ 10,50)
- Para contagens, forneça números exatos`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: modelo,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: mensagem }
      ],
      max_tokens: 500, // Limitar tokens para economizar
      temperature: 0.3 // Respostas mais consistentes
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos timeout
    }
  );

  return response.data.choices[0].message.content;
}



// ====================================
// 🛠️ UTILITÁRIOS
// ====================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Limpar cache periodicamente (evitar memory leak)
setInterval(() => {
  if (responseCache.size > 100) {
    responseCache.clear();
    console.log('🧹 Cache limpo');
  }
}, 300000); // 5 minutos

module.exports = { perguntarIA };
