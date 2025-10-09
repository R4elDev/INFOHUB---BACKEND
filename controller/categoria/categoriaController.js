/*****************************************************************************************
 * Objetivo --> Controller responsavel pela manipulação dos dados referentes a categoria
 * Data --> 09/10/2025
 * Autor --> GitHub Copilot
 ****************************************************************************************/

const categoriaDAO = require('../../model/DAO/categoria.js');
const message = require('../../modulo/config.js');

// ====================== POST ======================
const createCategoria = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (dadosBody.nome == '' || dadosBody.nome == undefined) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let novaCategoria = await categoriaDAO.insertCategoria(dadosBody);

            if (novaCategoria) {
                status = true;
                status_code = 201;
                mensagem.message = message.SUCCESS_CREATED_ITEM;
                mensagem.id = novaCategoria;
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
const updateCategoria = async function (dadosBody, contentType) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (contentType === 'application/json') {
        if (
            dadosBody.id_categoria == '' || dadosBody.id_categoria == undefined ||
            dadosBody.nome == '' || dadosBody.nome == undefined
        ) {
            status_code = 400;
            mensagem.message = message.ERROR_REQUIRED_FIELDS;
        } else {
            let resultado = await categoriaDAO.updateCategoria(dadosBody);

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
const deleteCategoria = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let resultado = await categoriaDAO.deleteCategoria(id);

        if (resultado) {
            status = true;
            status_code = 200;
            mensagem.message = message.SUCCESS_DELETED_ITEM;
        } else {
            status_code = 400;
            mensagem.message = "Não é possível excluir uma categoria que possui produtos associados";
        }
    }

    return {
        status: status,
        status_code: status_code,
        message: mensagem.message
    };
}

// ====================== GET ======================
const getCategorias = async function () {
    let status = false;
    let status_code;
    let mensagem = {};

    let dados = await categoriaDAO.selectAllCategorias();

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
        categorias: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

const getCategoriaById = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await categoriaDAO.selectCategoriaById(id);

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
        categoria: mensagem.length ? mensagem[0] : null,
        message: mensagem.message || null
    };
}

const getCategoriasComProdutos = async function () {
    let status = false;
    let status_code;
    let mensagem = {};

    let dados = await categoriaDAO.selectCategoriasComProdutos();

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
        categorias: mensagem.length ? mensagem : null,
        message: mensagem.message || null
    };
}

const getCategoriaComProdutosById = async function (id) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (id == '' || id == undefined || isNaN(id)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        let dados = await categoriaDAO.selectCategoriaComProdutosById(id);

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
        categoria: mensagem.length ? mensagem[0] : null,
        message: mensagem.message || null
    };
}

module.exports = {
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategorias,
    getCategoriaById,
    getCategoriasComProdutos,
    getCategoriaComProdutosById
}