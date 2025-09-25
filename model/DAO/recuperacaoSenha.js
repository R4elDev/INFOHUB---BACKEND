/*****************************************************************************************
 * Objetivo --> Model responsável pelo CRUD de dados referente à recuperação de senha
 * Data --> 25/09/2025
 * Autor --> Israel
 ****************************************************************************************/

// Import da biblioteca do PRISMA/CLIENT para executar scripts no Banco de Dados
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertRecuperacao = async function (id_usuario, codigo, expiracao){
    try{
        let sql = `
            INSERT INTO tbl_recuperacaoSenha ( id_usuario, codigo,expiracao)
            VALUES (
                ${id_usuario},
                '${codigo}',
                '${expiracao.toISOString().slice(0,19).replace('T',' ')}'
            );
        `

        let result = await prisma.$executeRawUnsafe(sql)

        if(result){
            let sqlSelect = `
                SELECT * 
                FROM tbl_recuperacaoSenha
                WHERE id_usuario = ${id_usuario}
                ORDER BY data_criacao DESC
                LIMIT 1;
            `

            let registroCriado = await prisma.$queryRawUnsafe(sqlSelect)
            return registroCriado[0]
        }else{
            return false
        }
    }catch(error){
        console.log("ERRO AO INSERIR RECUPERAÇÃO --> ", error)
        return false
    }
}

// ================================ SELECIONAR POR CODIGO =================================


const selectByCodigo = async function (codigo){
    try{
        let sql = `
            SELECT * 
            FROM tbl_recuperacaoSenha
            WHERE codigo = '${codigo}' AND usado = false
            ORDER BY data_criacao DESC
            LIMIT 1;
        `

        let result = await prisma.$queryRawUnsafe(sql)
        return result && result.length > 0 ? result[0] : false
    }catch(error){
        console.log("ERRO AO BUSCAR RECUPERAÇAO POR CODIGO --> ", error)
        return false
    }
}

// ================================ UPDATE QUANDO FOI USADO =================================
const marcarComoUsado = async function(id){
    try{
        let sql = `
            UPDATE tbl_recuperacaoSenha
            SET usado = true
            WHERE id = ${id};
        `

        let result = await prisma.$executeRawUnsafe(sql)
        
        if(result){
            return true
        }else{
            return false
        }
    }catch(error){
        console.log("ERRO AO MARCAR COMO USADO--> ", error)
        return false
    }
}


module.exports = {
    insertRecuperacao,
    selectByCodigo,
    marcarComoUsado
}