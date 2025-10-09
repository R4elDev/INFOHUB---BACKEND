/*****************************************************************************************
 * Objetivo --> Controller responsavel pela manipulação dos dados referentes a produto
 * Data --> 09/10/2025
 * Autor --> ISRAEL
 ****************************************************************************************/

const produtoDAO = require('../../model/DAO/produto.js');
const message = require('../../modulo/config.js');

// ====================== POST ======================
const createProduto = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.nome == '' || dadosBody.nome == undefined || 
            dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.preco == '' || dadosBody.preco == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novoProduto = await produtoDAO.insertProduto(dadosBody);

            if (novoProduto) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novoProduto;
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
const updateProduto = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_produto == '' || dadosBody.id_produto == undefined ||
            dadosBody.nome == '' || dadosBody.nome == undefined || 
            dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||
            dadosBody.id_estabelecimento == '' || dadosBody.id_estabelecimento == undefined ||
            dadosBody.preco == '' || dadosBody.preco == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let resultado = await produtoDAO.updateProduto(dadosBody);

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
const deleteProduto = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let resultado = await produtoDAO.deleteProduto(id);

        if (resultado) {
            status = true;
            status_code = 200;
            mensagem.message = message.SUCCESS_DELETED_ITEM;
        } else {
            status_code = 500;
            mensagem.message = message.ERROR_INTERNAL_SERVER;
        }
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message
    };
}

// ====================== GET ======================
const getProdutos = async function () {
    let status = false;
    let status_code;
    let mensagem = {};

    let dados = await produtoDAO.selectAllProdutos();

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
        produtos: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

const getProdutoById = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await produtoDAO.selectProdutoById(id);

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
        produto: mensagem.length ? mensagem[0] : null,
        message: mensagem.message || null
    };
}

module.exports = {
    createProduto,
    updateProduto,
    deleteProduto,
    getProdutos,
    getProdutoById
}