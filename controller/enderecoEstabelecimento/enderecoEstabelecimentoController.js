/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do ENDEREÇO DE ESTABELECIMENTO
 * Data ==> 29/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const enderecoEstabelecimentoDAO = require('../../model/DAO/enderecoEstabelecimento.js');

/**
 * CRIAR/ATUALIZAR ENDEREÇO DO ESTABELECIMENTO
 */
const criarEnderecoEstabelecimento = async function (dadosEndereco, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_estabelecimento, cep, logradouro, numero, bairro, cidade, estado } = dadosEndereco;

        if (!id_estabelecimento || !cep) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_estabelecimento' e 'cep' são obrigatórios."
            };
        }

        let resultEndereco = await enderecoEstabelecimentoDAO.insertEnderecoEstabelecimento(dadosEndereco);

        if (resultEndereco) {
            return {
                status: true,
                status_code: 201,
                message: "Endereço do estabelecimento salvo com sucesso.",
                data: resultEndereco
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR ENDEREÇO ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR ENDEREÇO DO ESTABELECIMENTO
 */
const atualizarEnderecoEstabelecimento = async function (dadosEndereco, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_estabelecimento, cep } = dadosEndereco;

        if (!id_estabelecimento || !cep) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_estabelecimento' e 'cep' são obrigatórios."
            };
        }

        let resultUpdate = await enderecoEstabelecimentoDAO.updateEnderecoEstabelecimento(dadosEndereco);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Endereço do estabelecimento atualizado com sucesso.",
                data: resultUpdate
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR ENDEREÇO ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * DELETAR ENDEREÇO DO ESTABELECIMENTO
 */
const deletarEnderecoEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let resultDelete = await enderecoEstabelecimentoDAO.deleteEnderecoEstabelecimento(id_estabelecimento);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Endereço do estabelecimento deletado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR ENDEREÇO ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * BUSCAR ENDEREÇO DO ESTABELECIMENTO
 */
const buscarEnderecoEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let resultEndereco = await enderecoEstabelecimentoDAO.selectEnderecoByEstabelecimento(id_estabelecimento);

        if (resultEndereco) {
            return {
                status: true,
                status_code: 200,
                message: "Endereço do estabelecimento encontrado.",
                data: resultEndereco
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Estabelecimento ainda não possui endereço cadastrado.",
                data: null
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER BUSCAR ENDEREÇO ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * PESQUISAR ESTABELECIMENTOS POR CEP
 */
const pesquisarPorCep = async function (cep) {
    try {
        if (!cep) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'cep' é obrigatório."
            };
        }

        let resultados = await enderecoEstabelecimentoDAO.pesquisarEstabelecimentosPorCep(cep);

        return {
            status: true,
            status_code: 200,
            message: resultados.length > 0 ? `${resultados.length} estabelecimento(s) encontrado(s).` : "Nenhum estabelecimento encontrado para este CEP.",
            quantidade: resultados.length,
            data: resultados
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER PESQUISAR POR CEP:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * PESQUISAR ESTABELECIMENTOS POR LOCAL (cidade, bairro, logradouro ou nome)
 */
const pesquisarPorLocal = async function (termo) {
    try {
        if (!termo) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'termo' é obrigatório."
            };
        }

        let resultados = await enderecoEstabelecimentoDAO.pesquisarEstabelecimentosPorLocal(termo);

        return {
            status: true,
            status_code: 200,
            message: resultados.length > 0 ? `${resultados.length} estabelecimento(s) encontrado(s).` : "Nenhum estabelecimento encontrado.",
            quantidade: resultados.length,
            data: resultados
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER PESQUISAR POR LOCAL:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * PESQUISAR ESTABELECIMENTOS PRÓXIMOS (por coordenadas)
 */
const pesquisarProximos = async function (latitude, longitude, raioKm) {
    try {
        if (!latitude || !longitude) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'latitude' e 'longitude' são obrigatórios."
            };
        }

        const raio = raioKm || 10; // Padrão: 10km
        let resultados = await enderecoEstabelecimentoDAO.pesquisarEstabelecimentosProximos(latitude, longitude, raio);

        return {
            status: true,
            status_code: 200,
            message: resultados.length > 0 ? `${resultados.length} estabelecimento(s) encontrado(s) em um raio de ${raio}km.` : "Nenhum estabelecimento encontrado próximo.",
            quantidade: resultados.length,
            raio_km: raio,
            data: resultados
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER PESQUISAR PRÓXIMOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR TODOS ESTABELECIMENTOS COM ENDEREÇO
 */
const listarTodos = async function () {
    try {
        let resultados = await enderecoEstabelecimentoDAO.listarEstabelecimentosComEndereco();

        return {
            status: true,
            status_code: 200,
            message: `${resultados.length} estabelecimento(s) encontrado(s).`,
            quantidade: resultados.length,
            data: resultados
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR TODOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    criarEnderecoEstabelecimento,
    atualizarEnderecoEstabelecimento,
    deletarEnderecoEstabelecimento,
    buscarEnderecoEstabelecimento,
    pesquisarPorCep,
    pesquisarPorLocal,
    pesquisarProximos,
    listarTodos
};
