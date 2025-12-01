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
  console.log(`🔍 Iniciando busca de resposta para: "${mensagem.substring(0, 50)}..."`);
  console.log(`📊 Contexto fornecido: ${contexto.length} caracteres`);
  
  for (let i = 0; i < MODELS.length; i++) {
    const modelo = MODELS[i];
    
    try {
      console.log(`🤖 [${i+1}/${MODELS.length}] Tentando modelo: ${modelo}`);
      const inicioTempo = Date.now();
      const resposta = await tentarGroq(mensagem, contexto, modelo);
      const tempoDecorrido = Date.now() - inicioTempo;
      
      console.log(`✅ Sucesso com ${modelo} em ${tempoDecorrido}ms`);
      
      // Cache da resposta bem-sucedida
      responseCache.set(cacheKey, resposta);
      
      return {
        resposta,
        fonte: `groq_${modelo}`,
        tempo_resposta: `${tempoDecorrido}ms`
      };
      
    } catch (error) {
      console.error(`❌ Falha no modelo ${modelo}:`, error.message);
      console.error(`   Tipo de erro:`, error.response?.status || 'Conexão/Timeout');
      
      // Se for rate limit, aguardar um pouco antes do próximo modelo
      if (error.message.includes('rate_limit')) {
        console.log('⏳ Rate limit - aguardando 5s...');
        await sleep(5000);
      }
      
      // Se for o último modelo e falhou, retornar fallback local
      if (i === MODELS.length - 1) {
        console.error('❌ TODOS OS MODELOS GROQ FALHARAM');
        console.error('Último erro:', error.message);
        console.error('Verifique sua GROQ_API_KEY e conexão com internet');
        
        // Retornar resposta de fallback local
        return {
          resposta: 'Desculpe, estou com dificuldades para me conectar ao servidor de IA no momento. Por favor, tente novamente em alguns instantes.',
          fonte: 'fallback_local',
          tempo_resposta: 'N/A',
          erro: error.message
        };
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
  try {
    const systemMessage = `Você é um assistente do InfoHub. ${contexto}

INSTRUÇÕES:
- Seja preciso e direto
- Use os dados fornecidos
- Formate números legíveis (ex: R$ 10,50)
- Para contagens, forneça números exatos`;

    console.log(`   📡 Conectando com Groq API...`);
    console.log(`   🔑 API Key configurada: ${GROQ_API_KEY ? 'Sim' : 'NÃO - PROBLEMA!'}`);
    
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

    console.log(`   ✅ Resposta recebida com sucesso`);
    return response.data.choices[0].message.content;
    
  } catch (error) {
    // Melhorar detalhes do erro
    if (error.response) {
      // Erro da API do Groq
      console.error(`   ⚠️  Erro da API Groq [${error.response.status}]:`, error.response.data);
      throw new Error(`Groq API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // Erro de conexão
      console.error(`   🌐 Erro de conexão - não conseguiu alcançar Groq API`);
      throw new Error('Erro de conexão com Groq API - verifique sua internet');
    } else {
      // Outro tipo de erro
      console.error(`   ❓ Erro desconhecido:`, error.message);
      throw error;
    }
  }
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
