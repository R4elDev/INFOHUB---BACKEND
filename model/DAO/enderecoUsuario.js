/*****************************************************************************************
 * Objetivo --> Model responsável pelo CRUD de dados referente a enderecoUsuario no BANCO DE DADOS
 * Data --> 25/09/2025
 * Autor --> Israel
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertEnderecoUsuario = async function (endereco) {
    try {
        let sql = `
            INSERT INTO tbl_enderecoUsuario (
                id_usuario, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude
            ) VALUES (
                ${endereco.id_usuario},
                '${endereco.cep}',
                '${endereco.logradouro}',
                '${endereco.numero}',
                '${endereco.complemento}',
                '${endereco.bairro}',
                '${endereco.cidade}',
                '${endereco.estado}',
                ${endereco.latitude},
                ${endereco.longitude}
            );
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT * 
                FROM tbl_enderecoUsuario 
                WHERE id_usuario = ${endereco.id_usuario}
                ORDER BY id_endereco DESC 
                LIMIT 1;
            `;
            let enderecoCriado = await prisma.$queryRawUnsafe(sqlSelect);
            return enderecoCriado[0];
        } else {
            return false;
        }
    } catch (error) {
        console.log("ERRO AO INSERIR ENDERECO USUARIO:", error);
        return false;
    }
};

// ================================ UPDATE =================================
const updateEnderecoUsuario = async function (endereco) {
    try {
        let sql = `
            UPDATE tbl_enderecoUsuario SET
                cep = '${endereco.cep}',
                logradouro = '${endereco.logradouro}',
                numero = '${endereco.numero}',
                complemento = '${endereco.complemento}',
                bairro = '${endereco.bairro}',
                cidade = '${endereco.cidade}',
                estado = '${endereco.estado}',
                latitude = ${endereco.latitude},
                longitude = ${endereco.longitude}
            WHERE id_endereco = ${endereco.id_endereco};
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR ENDERECO USUARIO:", error);
        return false;
    }
};

// ================================ DELETE =================================
const deleteEnderecoUsuario = async function (id) {
    try {
        let sql = `DELETE FROM tbl_enderecoUsuario WHERE id_endereco = ${id}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR ENDERECO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT ALL =================================
const selectAllEnderecoUsuario = async function () {
    try {
        let sql = `SELECT * FROM tbl_enderecoUsuario`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO LISTAR ENDERECOS USUARIO:", error);
        return false;
    }
};

// ================================ SELECT BY ID =================================
const selectByIdEnderecoUsuario = async function (id) {
    try {
        let sql = `SELECT * FROM tbl_enderecoUsuario WHERE id_endereco = ${id}`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ENDERECO USUARIO POR ID:", error);
        return false;
    }
};

// ================================ SELECT BY USUARIO =================================
const selectByUsuarioEnderecoUsuario = async function (id_usuario) {
    try {
        let sql = `SELECT * FROM tbl_enderecoUsuario WHERE id_usuario = ${id_usuario}`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ENDERECO POR USUARIO:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertEnderecoUsuario,
    updateEnderecoUsuario,
    deleteEnderecoUsuario,
    selectAllEnderecoUsuario,
    selectByIdEnderecoUsuario,
    selectByUsuarioEnderecoUsuario
};
