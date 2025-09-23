/*****************************************************************************************
 * Objetivo --> Model responsável pelo CRUD da recuperação de senha
 * Data --> 23/09/2025
 * Autor --> Israel
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Momento do clique de pedir recuperação

const insertRecuperacao = async function (id_usuario,codigo,expiracao){
    try {
        let sql = `
            INSERT INTO tbl_recuperacaoSenha (
                id_usuario,codigo,expiracao,usado
            ) VALUES (
                ${id_usuario}, '${codigo}', '${expiracao}', false 
            );`

        let result = await prisma.$executeRawUnsafe(sql)

        if (result) {
            return true;
        } else {
            return false;
        }
        

    }catch(error){
        console.log("ERRO AO INSERIR RECUPERAÇÃO", error)
        return false
    }
}


// Validar o codigo enviado
const validarCodigo = async function (id_usuario, codigo){
    try{
        // Trazendo para mim o codigo que foi guardado, assim consigo ver se é de agora
        let sql = `
            SELECT * FROM tbl_recuparacaoSenha
            WHERE id_usuario = ${id_usuario}
            AND codigo = '${codigo}'
            AND expiracao > NOW()
            AND usado = false
            ORDERY BY id DESC
            LIMIT 1;
        `

        let result = await prisma.$queryRawUnsafe(sql)
        
        if (result && result.length > 0) {
            return result[0]
        } else {
            return false
        }
    }catch (error){
        console.log("ERRO AO VALIDAR CÓDIGO", error)
        return false
    }
}

// Marcar como usado

const marcarComoUsado = async function (id){
    try{
        let sql = `
            UPDATE tbl_recuperacaoSenha
            SET usado = true
            where id = ${id};
        `
        let result = await prisma.$executeRawUnsafe(sql)

        if (result) {
            return true;
        } else {
            return false;
        }
    }catch(error){
        console.log("ERRO AO MARCAR COMO USADO:", error)
        return false
    }
}


module.exports = {
    insertRecuperacao,
    validarCodigo,
    marcarComoUsado
};
