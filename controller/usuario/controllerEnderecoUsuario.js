/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CRUD do enderecoUsuario
 * Data ==> 25/09/2025
 * Autor ==> Israel
 * Versão ==> 1.0
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const enderecoDAO = require('../../model/DAO/enderecoUsuario.js');
const controllerUsuario = require('../usuario/controllerUsuario.js'); // RELACIONAMENTO COM USUÁRIO

// Função para inserir um novo endereço
const inserirEnderecoUsuario = async function (endereco, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        if (
            endereco.id_usuario == undefined || endereco.id_usuario == '' || endereco.id_usuario == null || endereco.id_usuario <= 0 ||
            endereco.cep == undefined || endereco.cep == '' || endereco.cep == null || endereco.cep.length > 20 ||
            endereco.logradouro == undefined || endereco.logradouro == '' || endereco.logradouro == null || endereco.logradouro.length > 150 ||
            endereco.numero == undefined || endereco.numero == '' || endereco.numero == null || endereco.numero.length > 10 ||
            endereco.bairro == undefined || endereco.bairro == '' || endereco.bairro == null || endereco.bairro.length > 100 ||
            endereco.cidade == undefined || endereco.cidade == '' || endereco.cidade == null || endereco.cidade.length > 100 ||
            endereco.estado == undefined || endereco.estado == '' || endereco.estado == null || endereco.estado.length > 2
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let resultEndereco = await enderecoDAO.insertEnderecoUsuario(endereco);

        if (resultEndereco) {
            return MESSAGE.SUCCESS_CREATED_ITEM;
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

// Função para atualizar um endereço
const atualizarEnderecoUsuario = async function (endereco, id, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        if (
            id == undefined || id == '' || id == null || isNaN(id) || id <= 0 ||
            endereco.id_usuario == undefined || endereco.id_usuario == '' || endereco.id_usuario == null || endereco.id_usuario <= 0 ||
            endereco.cep == undefined || endereco.cep == '' || endereco.cep == null || endereco.cep.length > 20 ||
            endereco.logradouro == undefined || endereco.logradouro == '' || endereco.logradouro == null || endereco.logradouro.length > 150 ||
            endereco.numero == undefined || endereco.numero == '' || endereco.numero == null || endereco.numero.length > 10 ||
            endereco.bairro == undefined || endereco.bairro == '' || endereco.bairro == null || endereco.bairro.length > 100 ||
            endereco.cidade == undefined || endereco.cidade == '' || endereco.cidade == null || endereco.cidade.length > 100 ||
            endereco.estado == undefined || endereco.estado == '' || endereco.estado == null || endereco.estado.length > 2
        ) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let resultEndereco = await buscarEnderecoUsuario(parseInt(id));

        if (resultEndereco.status_code == 200) {
            endereco.id_endereco = parseInt(id);
            let result = await enderecoDAO.updateEnderecoUsuario(endereco);

            if (result) {
                return MESSAGE.SUCCESS_UPDATED_ITEM;
            } else {
                return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
            }
        } else if (resultEndereco.status_code == 404) {
            return MESSAGE.ERROR_NOT_FOUND;
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

// Função para excluir um endereço
const excluirEnderecoUsuario = async function (id) {
    try {
        if (id == undefined || id == '' || id == null || isNaN(id) || id <= 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let resultEndereco = await buscarEnderecoUsuario(parseInt(id));

        if (resultEndereco.status_code == 200) {
            let result = await enderecoDAO.deleteEnderecoUsuario(parseInt(id));

            if (result) {
                return MESSAGE.SUCCESS_DELETED_ITEM;
            } else {
                return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
            }
        } else if (resultEndereco.status_code == 404) {
            return MESSAGE.ERROR_NOT_FOUND;
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

// Função para listar todos os endereços com dados do usuário relacionado
const listarEnderecosUsuario = async function () {
    try {
        const arrayEnderecos = [];
        const dadosEnderecos = {};

        let resultEnderecos = await enderecoDAO.selectAllEnderecoUsuario();

        if (resultEnderecos != false && typeof resultEnderecos == 'object') {
            if (resultEnderecos.length > 0) {
                dadosEnderecos.status = true;
                dadosEnderecos.status_code = 200;
                dadosEnderecos.items = resultEnderecos.length;

                for (itemEndereco of resultEnderecos) {
                    let dadosUsuario = await controllerUsuario.buscarUsuario(itemEndereco.id_usuario);
                    itemEndereco.usuario = dadosUsuario.usuario || null;
                    delete itemEndereco.id_usuario;
                    arrayEnderecos.push(itemEndereco);
                }

                dadosEnderecos.enderecos = arrayEnderecos;
                return dadosEnderecos;
            } else {
                return MESSAGE.ERROR_NOT_FOUND;
            }
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.error(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

// Função para buscar um endereço específico com dados do usuário
const buscarEnderecoUsuario = async function (id) {
    try {
        const arrayEnderecos = {};
        if (id == undefined || id == '' || id == null || isNaN(id) || id <= 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let resultEndereco = await enderecoDAO.selectByIdEnderecoUsuario(parseInt(id));

        if (resultEndereco != false && typeof resultEndereco == 'object') {
            if (resultEndereco.length > 0) {
                arrayEnderecos.status = true;
                arrayEnderecos.status_code = 200;

                for (itemEndereco of resultEndereco) {
                    let dadosUsuario = await controllerUsuario.buscarUsuario(itemEndereco.id_usuario);
                    itemEndereco.usuario = dadosUsuario.usuario || null;
                    delete itemEndereco.id_usuario;
                }

                arrayEnderecos.enderecos = resultEndereco;
                return arrayEnderecos;
            } else {
                return MESSAGE.ERROR_NOT_FOUND;
            }
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
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
    buscarEnderecoUsuario
};
