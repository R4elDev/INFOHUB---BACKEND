/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CRUD do enderecoUsuario
 * Data ==> 25/09/2025
 * Autor ==> Israel
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const enderecoDAO = require('../../model/DAO/enderecoUsuario.js');

/**
 * INSERIR
 */
const inserirEnderecoUsuario = async function (endereco, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        if (
            !endereco.id_usuario || endereco.id_usuario <= 0 ||
            !endereco.cep || endereco.cep.length > 20 ||
            !endereco.logradouro || endereco.logradouro.length > 150 ||
            !endereco.numero || endereco.numero.length > 10 ||
            (endereco.complemento && endereco.complemento.length > 150) ||
            !endereco.bairro || endereco.bairro.length > 100 ||
            !endereco.cidade || endereco.cidade.length > 100 ||
            !endereco.estado || endereco.estado.length > 2 ||
            (endereco.latitude && isNaN(endereco.latitude)) ||
            (endereco.longitude && isNaN(endereco.longitude))
        ) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultEndereco = await enderecoDAO.insertEnderecoUsuario(endereco);

        if (resultEndereco) {
            return {
                status: true,
                status_code: 200,
                message: 'Endereço criado com sucesso!',
                endereco: resultEndereco
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * ATUALIZAR
 */
const atualizarEnderecoUsuario = async function (endereco, id, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        if (
            !id || isNaN(id) || id <= 0 ||
            !endereco.id_usuario || endereco.id_usuario <= 0 ||
            !endereco.cep || endereco.cep.length > 20 ||
            !endereco.logradouro || endereco.logradouro.length > 150 ||
            !endereco.numero || endereco.numero.length > 10 ||
            (endereco.complemento && endereco.complemento.length > 150) ||
            !endereco.bairro || endereco.bairro.length > 100 ||
            !endereco.cidade || endereco.cidade.length > 100 ||
            !endereco.estado || endereco.estado.length > 2 ||
            (endereco.latitude && isNaN(endereco.latitude)) ||
            (endereco.longitude && isNaN(endereco.longitude))
        ) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultEndereco = await buscarEnderecoUsuario(parseInt(id));
        if (resultEndereco.status_code !== 200) return resultEndereco;

        endereco.id_endereco = parseInt(id);

        let result = await enderecoDAO.updateEnderecoUsuario(endereco);

        if (result) {
            return {
                status: true,
                status_code: 200,
                message: 'Endereço atualizado com sucesso!',
                endereco: endereco
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * EXCLUIR
 */
const excluirEnderecoUsuario = async function (id) {
    try {
        if (!id || isNaN(id) || id <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultEndereco = await buscarEnderecoUsuario(parseInt(id));
        if (resultEndereco.status_code !== 200) return resultEndereco;

        let result = await enderecoDAO.deleteEnderecoUsuario(parseInt(id));

        if (result) {
            return {
                status: true,
                status_code: 200,
                message: 'Endereço excluído com sucesso!'
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR TODOS
 */
const listarEnderecosUsuario = async function () {
    try {
        let resultEndereco = await enderecoDAO.selectAllEnderecoUsuario();

        if (resultEndereco && typeof resultEndereco === 'object' && resultEndereco.length > 0) {
            return {
                status: true,
                status_code: 200,
                items: resultEndereco.length,
                enderecos: resultEndereco
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * BUSCAR POR ID
 */
const buscarEnderecoUsuario = async function (id) {
    try {
        if (!id || isNaN(id) || id <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultEndereco = await enderecoDAO.selectByIdEnderecoUsuario(parseInt(id));

        if (resultEndereco) {
            return {
                status: true,
                status_code: 200,
                endereco: resultEndereco
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * BUSCAR POR USUARIO
 */
const buscarEnderecosPorUsuario = async function (id_usuario) {
    try {
        if (!id_usuario || isNaN(id_usuario) || id_usuario <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultEndereco = await enderecoDAO.selectByUsuarioEnderecoUsuario(parseInt(id_usuario));

        if (resultEndereco && resultEndereco.length > 0) {
            return {
                status: true,
                status_code: 200,
                items: resultEndereco.length,
                enderecos: resultEndereco
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

module.exports = {
    inserirEnderecoUsuario,
    atualizarEnderecoUsuario,
    excluirEnderecoUsuario,
    listarEnderecosUsuario,
    buscarEnderecoUsuario,
    buscarEnderecosPorUsuario
};
