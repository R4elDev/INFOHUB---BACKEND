/*****************************************************************************************
 * Objetivo --> Controller responsavel pela manipulação dos dados referentes a estabelecimento
 * Data --> 09/10/2025
 * Autor --> GitHub Copilot
 ****************************************************************************************/

const estabelecimentoDAO = require('../../model/DAO/estabelecimento.js');
const message = require('../../modulo/config.js');

// ====================== POST ======================
const createEstabelecimento = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.nome == '' || dadosBody.nome == undefined ||
            dadosBody.cnpj == '' || dadosBody.cnpj == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novoEstabelecimento = await estabelecimentoDAO.insertEstabelecimento(dadosBody);

            if (novoEstabelecimento) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novoEstabelecimento.id_estabelecimento;
            } else {
                status_code = 500;
                mensagem.message = message.ERROR_INTERNAL_SERVER;
            }
        }
    } else {
        status_code = 415;
        mensagem.message = message.ERROR_INCORRECT_CONTENT_TYPE;
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message,
        id: mensagem.id
    };
}

// ====================== PUT ======================
const updateEstabelecimento = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.nome == '' || dadosBody.nome == undefined ||
            dadosBody.cnpj == '' || dadosBody.cnpj == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let resultado = await estabelecimentoDAO.updateEstabelecimento(dadosBody);

            if (resultado) {
                status = true;
                status_code = 200;
                mensagem.message = message.SUCCESS_UPDATED_ITEM;
            } else {
                status_code = 500;
                mensagem.message = message.ERROR_INTERNAL_SERVER;
            }
        }
    } else {
        status_code = 415;
        mensagem.message = message.ERROR_INCORRECT_CONTENT_TYPE;
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message
    };
}

// ====================== DELETE ======================
const deleteEstabelecimento = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let resultado = await estabelecimentoDAO.deleteEstabelecimento(id);

        if (resultado) {
            status = true;
            status_code = 200;
            mensagem.message = message.SUCCESS_DELETED_ITEM;
        } else {
            status_code = 400;
            mensagem.message = "Não é possível excluir um estabelecimento que possui produtos ou promoções associados";
        }
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message
    };
}

// ====================== GET ======================
const getEstabelecimentos = async function () {
    let status = false;
    let status_code;
    let mensagem = {};

    let dados = await estabelecimentoDAO.selectAllEstabelecimentos();

    if (dados) {
        if (dados.length > 0) {
            status = true;
            status_code = 200;
            mensagem = dados;
        } else {
            status_code = 404;
            mensagem.message = message.ERROR_NOT_FOUND;
        }
    } else {
        status_code = 500;
        mensagem.message = message.ERROR_INTERNAL_SERVER;
    }

    return {
        status: status,
        status_code: status_code,
        estabelecimentos: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

const getEstabelecimentoById = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await estabelecimentoDAO.selectEstabelecimentoById(id);

        if (dados) {
            if (dados.length > 0) {
                status = true;
                status_code = 200;
                mensagem = dados;
            } else {
                status_code = 404;
                mensagem.message = message.ERROR_NOT_FOUND;
            }
        } else {
            status_code = 500;
            mensagem.message = message.ERROR_INTERNAL_SERVER;
        }
    }

    return {
        status: status,
        status_code: status_code,
        estabelecimento: mensagem.length ? mensagem[0] : null,
        message: mensagem.message || null
    };
}

module.exports = {
    createEstabelecimento,
    updateEstabelecimento,
    deleteEstabelecimento,
    getEstabelecimentos,
    getEstabelecimentoById
}