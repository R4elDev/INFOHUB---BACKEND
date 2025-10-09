/*****************************************************************************************
 * Objetivo --> Controller responsavel pela manipulação dos dados referentes a endereco de usuario
 * Data --> 09/10/2025
 * Autor --> GitHub Copilot
 ****************************************************************************************/

const enderecoUsuarioDAO = require('../../model/DAO/enderecoUsuario.js');
const message = require('../../modulo/config.js');

// ====================== POST ======================
const createEnderecoUsuario = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_usuario == '' || dadosBody.id_usuario == undefined ||
            dadosBody.cep == '' || dadosBody.cep == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novoEndereco = await enderecoUsuarioDAO.insertEnderecoUsuario(dadosBody);

            if (novoEndereco) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novoEndereco;
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
const updateEnderecoUsuario = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_endereco == '' || dadosBody.id_endereco == undefined ||
            dadosBody.id_usuario == '' || dadosBody.id_usuario == undefined ||
            dadosBody.cep == '' || dadosBody.cep == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let resultado = await enderecoUsuarioDAO.updateEnderecoUsuario(dadosBody);

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
const deleteEnderecoUsuario = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let resultado = await enderecoUsuarioDAO.deleteEnderecoUsuario(id);

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
const getEnderecosUsuario = async function () {
    let status = false;
    let status_code;
    let mensagem = {};

    let dados = await enderecoUsuarioDAO.selectAllEnderecosUsuario();

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
        enderecos: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

const getEnderecoUsuarioById = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await enderecoUsuarioDAO.selectEnderecoUsuarioById(id);

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
        endereco: mensagem.length ? mensagem[0] : null,
        message: mensagem.message || null
    };
}

const getEnderecosByUsuarioId = async function (id_usuario) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id_usuario == '' || id_usuario == undefined || isNaN(id_usuario)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await enderecoUsuarioDAO.selectEnderecosByUsuarioId(id_usuario);

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
        enderecos: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

module.exports = {
    createEnderecoUsuario,
    updateEnderecoUsuario,
    deleteEnderecoUsuario,
    getEnderecosUsuario,
    getEnderecoUsuarioById,
    getEnderecosByUsuarioId
}