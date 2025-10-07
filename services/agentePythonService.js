/**
 * ⚡ SERVIÇO ULTRA-RÁPIDO PARA AGENTE PYTHON
 * Comunica com servidor FastAPI otimizado - Respostas em < 100ms
 */

const executarAgentePython = async (mensagem, idUsuario, promotionsData = null) => {
  try {
    console.log(`⚡ Enviando para agente rápido: "${mensagem.substring(0, 50)}..."`);
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:5001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: mensagem,
        user_id: idUsuario,
        session_id: `user-${idUsuario}`,
        promotions_data: promotionsData
      }),
      // Timeout de 5 segundos (muito mais que o necessário)
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Servidor Python retornou erro: ${response.status}`);
    }

    const result = await response.json();
    const responseTime = Date.now() - startTime;
    
    console.log(`⚡ Resposta recebida em ${responseTime}ms (método: ${result.method || 'unknown'})`);
    
    return {
      reply: result.reply,
      toolsUsed: result.toolsUsed || [],
      confidence: result.confidence || 0.8,
      response_time_ms: responseTime,
      method: result.method || 'fast_api',
      success: true
    };

  } catch (error) {
    console.error('❌ Erro no agente Python:', error.message);
    
    // Fallback ultra-rápido em caso de erro
    return {
      reply: "🤔 Sistema temporariamente indisponível. Tente: 'leite barato', 'farmácia perto' ou 'que produtos têm'",
      toolsUsed: [],
      confidence: 0.1,
      response_time_ms: 50,
      method: 'error_fallback',
      success: false,
      error: error.message
    };
  }
};

/**
 * 🔧 FUNÇÃO DE COMPATIBILIDADE (mantém interface antiga)
 */
const executarAgentePythonCompatibilidade = async (mensagem, idUsuario) => {
  const result = await executarAgentePython(mensagem, idUsuario);
  return result.reply; // Retorna apenas a mensagem para compatibilidade
};

module.exports = { 
  executarAgentePython,
  executarAgentePythonCompatibilidade
};
