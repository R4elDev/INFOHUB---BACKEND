/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do Chat/IA
 * Data ==> 07/10/2025
 * Autor ==> Israel
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const agenteDAO = require('../../model/DAO/agente.js');

/**
 * ⚡ BUSCAR PROMOÇÕES COM AGENTE IA ULTRA-RÁPIDO - LINGUAGEM NATURAL
 * Agora usa o agente relâmpago (< 50ms) em vez do Ollama lento
 */
const buscarPromocoes = async function (mensagem, idUsuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!mensagem || !idUsuario) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        console.log(`⚡ Processando: "${mensagem}" para usuário ${idUsuario}`);

        // 1) Buscar promoções no banco primeiro para contexto
        const termoBusca = extrairProdutoSimples(mensagem);
        let dadosPromocoes = await agenteDAO.buscarPromocoes(termoBusca, idUsuario);

        // 2) Resposta simples sem agente Python (use Groq em vez disso)
        return {
            status: true,
            status_code: 200,
            message: 'Use o endpoint /chat-groq para IA inteligente',
            quantidade: dadosPromocoes ? dadosPromocoes.length : 0,
            promocoes: dadosPromocoes || [],
            reply: `Encontrei ${dadosPromocoes ? dadosPromocoes.length : 0} promoções. Para respostas inteligentes, use o endpoint /chat-groq`,
            response_time_ms: 10,
            method: "simple_search",
            agent_version: "groq-redirect"
        };

    } catch (error) {
        console.log('❌ ERRO AO BUSCAR PROMOÇÕES:', error);
        
        // Fallback ultra-rápido
        return {
            status: false,
            status_code: 500,
            message: 'Erro temporário no sistema.',
            reply: "🤔 Sistema temporariamente indisponível. Tente: 'leite barato', 'farmácia perto' ou 'que produtos têm'",
            response_time_ms: 10,
            method: "error_fallback"
        };
    }
};

/**
 * 🔧 EXTRAÇÃO SIMPLES DE PRODUTO (otimizada)
 */
const extrairProdutoSimples = (mensagem) => {
    const texto = mensagem.toLowerCase();
    const produtos = ['leite', 'iogurte', 'suco', 'shampoo', 'detergente', 'arroz', 'feijão', 'açúcar', 'óleo', 'queijo', 'manteiga', 'cerveja', 'refrigerante'];
    
    for (let produto of produtos) {
        if (texto.includes(produto)) {
            return produto;
        }
    }
    return ''; // Busca genérica
};

/**
 * RESPOSTA OLLAMA
 */
const respostaOllama = async function (mensagem, idUsuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!mensagem || !idUsuario) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        const response = await fetch("http://localhost:5001/ollama", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mensagem: mensagem,
                idUsuario: idUsuario
            })
        });

        if (!response.ok) {
            return {
                status: false,
                status_code: response.status,
                message: "Erro ao conectar com o agente Ollama."
            };
        }

        const data = await response.json();

        return {
            status: true,
            status_code: 200,
            message: "Resposta obtida com sucesso!",
            respostaIA: data
        };

    } catch (error) {
        console.log("ERRO AO CHAMAR OLLAMA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

module.exports = {
    buscarPromocoes,
    respostaOllama
};
