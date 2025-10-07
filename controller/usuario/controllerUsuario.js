/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do Chat/IA
 * Data ==> 07/10/2025
 * Autor ==> Israel
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const chatDAO = require('../../model/DAO/chat.js');
const fetch = require('node-fetch'); // Fetch para chamadas HTTP

/**
 * BUSCAR PROMOÇÕES
 */
const buscarPromocoes = async function (termoBusca, idUsuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!termoBusca || !idUsuario) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let dadosPromocoes = await chatDAO.buscarPromocoes(termoBusca, idUsuario);

        if (dadosPromocoes && dadosPromocoes.length > 0) {
            return {
                status: true,
                status_code: 200,
                message: 'Promoções encontradas com sucesso!',
                quantidade: dadosPromocoes.length,
                promocoes: dadosPromocoes
            };
        } else {
            return {
                status: false,
                status_code: 404,
                message: 'Nenhuma promoção encontrada para sua busca.'
            };
        }
    } catch (error) {
        console.log('ERRO AO BUSCAR PROMOÇÕES:', error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
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

        const response = await fetch("http://localhost:5000/ollama", {
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
