/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a enderecos de usuario no BANCO DE DADOS
 * Data --> 09/10/2025
 * Autor --> GitHub Copilot
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertEnderecoUsuario = async function (endereco) {
    try {
        let sql = `
            INSERT INTO tbl_enderecoUsuario (
                id_usuario, cep, logradouro, numero, complemento, 
                bairro, cidade, estado, latitude, longitude
            ) VALUES (
                ${endereco.id_usuario},
                '${endereco.cep}',
                ${endereco.logradouro ? `'${endereco.logradouro}'` : 'NULL'},
                ${endereco.numero ? `'${endereco.numero}'` : 'NULL'},
                ${endereco.complemento ? `'${endereco.complemento}'` : 'NULL'},
                ${endereco.bairro ? `'${endereco.bairro}'` : 'NULL'},
                ${endereco.cidade ? `'${endereco.cidade}'` : 'NULL'},
                ${endereco.estado ? `'${endereco.estado}'` : 'NULL'},
                ${endereco.latitude ? endereco.latitude : 'NULL'},
                ${endereco.longitude ? endereco.longitude : 'NULL'}
            );
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Pegar o ID do endereço recém inserido
            let sqlLastId = 'SELECT LAST_INSERT_ID() as id;';
            let [{id}] = await prisma.$queryRawUnsafe(sqlLastId);
            return id;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ UPDATE =================================
const updateEnderecoUsuario = async function (endereco) {
    try {
        let sql = `
            UPDATE tbl_enderecoUsuario SET
                id_usuario = ${endereco.id_usuario},
                cep = '${endereco.cep}',
                logradouro = ${endereco.logradouro ? `'${endereco.logradouro}'` : 'NULL'},
                numero = ${endereco.numero ? `'${endereco.numero}'` : 'NULL'},
                complemento = ${endereco.complemento ? `'${endereco.complemento}'` : 'NULL'},
                bairro = ${endereco.bairro ? `'${endereco.bairro}'` : 'NULL'},
                cidade = ${endereco.cidade ? `'${endereco.cidade}'` : 'NULL'},
                estado = ${endereco.estado ? `'${endereco.estado}'` : 'NULL'},
                latitude = ${endereco.latitude ? endereco.latitude : 'NULL'},
                longitude = ${endereco.longitude ? endereco.longitude : 'NULL'}
            WHERE id_endereco = ${endereco.id_endereco};
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ DELETE =================================
const deleteEnderecoUsuario = async function (id_endereco) {
    try {
        let sql = `
            DELETE FROM tbl_enderecoUsuario 
            WHERE id_endereco = ${id_endereco};
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ SELECT =================================
const selectAllEnderecosUsuario = async function () {
    try {
        let sql = `
            SELECT 
                eu.id_endereco,
                eu.id_usuario,
                eu.cep,
                eu.logradouro,
                eu.numero,
                eu.complemento,
                eu.bairro,
                eu.cidade,
                eu.estado,
                eu.latitude,
                eu.longitude,
                u.nome as nome_usuario,
                u.email as email_usuario
            FROM tbl_enderecoUsuario eu
            INNER JOIN tbl_usuario u ON u.id_usuario = eu.id_usuario;
        `;

        let rsEnderecos = await prisma.$queryRawUnsafe(sql);

        return rsEnderecos;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectEnderecoUsuarioById = async function (id_endereco) {
    try {
        let sql = `
            SELECT 
                eu.id_endereco,
                eu.id_usuario,
                eu.cep,
                eu.logradouro,
                eu.numero,
                eu.complemento,
                eu.bairro,
                eu.cidade,
                eu.estado,
                eu.latitude,
                eu.longitude,
                u.nome as nome_usuario,
                u.email as email_usuario
            FROM tbl_enderecoUsuario eu
            INNER JOIN tbl_usuario u ON u.id_usuario = eu.id_usuario
            WHERE eu.id_endereco = ${id_endereco};
        `;

        let rsEndereco = await prisma.$queryRawUnsafe(sql);

        return rsEndereco;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectEnderecosByUsuarioId = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                eu.id_endereco,
                eu.id_usuario,
                eu.cep,
                eu.logradouro,
                eu.numero,
                eu.complemento,
                eu.bairro,
                eu.cidade,
                eu.estado,
                eu.latitude,
                eu.longitude
            FROM tbl_enderecoUsuario eu
            WHERE eu.id_usuario = ${id_usuario};
        `;

        let rsEnderecos = await prisma.$queryRawUnsafe(sql);

        return rsEnderecos;

    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    insertEnderecoUsuario,
    updateEnderecoUsuario,
    deleteEnderecoUsuario,
    selectAllEnderecosUsuario,
    selectEnderecoUsuarioById,
    selectEnderecosByUsuarioId
}