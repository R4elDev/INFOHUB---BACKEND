/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a usuario no BANCO DE DADOS
 * Data --> 18/09/2025
 * Autor --> Israel
 ****************************************************************************************/

// Import da biblioteca do PRISMA/CLIENT para executar scripts no Banco de Dados
const { PrismaClient } = require('@prisma/client')


//Instancia da classe do prisma client, para gerar um objeto
const prisma = new PrismaClient()

//Funcao para inserir um novo usuario

const insertUsuario = async function (usuario) {
    try{
        let sql = `insert into tbl_usuario (nome,email,senha_hash,perfil)
    values(
        '${usuario.nome}',
        '${usuario.email}',
        '${usuario.senha_hash}',
        '${usuario.perfil}'
    );`

        let result = await prisma.$executeRawUnsafe(sql)

        if (result) {
            let sqlSelect = `SELECT * from tbl_usuario where email = '${usuario.email}' ORDER BY id_usuario DESC LIMIT 1;`

            let usuarioCriado = await prisma.$queryRawUnsafe(sqlSelect)
            return usuarioCriado[0]
        }else {
            return false
        }
    } catch (error) {
        console.log("ERRO AO INSERIR USUARIO:", error)
        return false
    }

}

const updateUsuario = async function (usuario) {  
    try {
        let sql = `update tbl_usuario set
            nome = '${usuario.nome}',
            email = '${usuario.email}',
            senha_hash = '${usuario.senha_hash}',
            perfil = '${usuario.perfil}'
        where id_usuario = ${usuario.id_usuario}`

        let result = await prisma.$executeRawUnsafe(sql)
        if (result) {
            return true
        } else {
            return false
        }
    }catch(error){
        console.log("ERRO AO ATUALIZAR USUARIO:", error)
        return false
    }
}

const deleteUsuario = async function (id) {
    try {
        let idUsuario = id
        let sql = `delete from tbl_usuario where id_usuario = ${idUsuario}`

        let result = await prisma.$executeRawUnsafe(sql)

        if(result){
            return true
        }else {
            return false
        }
    }catch(error){
        console.log("ERRO AO DELETAR USUARIO:", error)
        return false
    }
}

const selectAllAnimal =  async function(){
    try {
        let sql = `select * from tbl_animal`

        let result = await prisma.$queryRawUnsafe(sql)

        if(result){
            return result
        }else {
            return false
        }
    }catch(error){
        return false
    }
}

const selectByIdAnimal = async function(id){
    try {
        let idUsuario = id
        let sql = `select * from tbl_animal where id_animal = ${idUsuario}`

        let result = await prisma.$queryRawUnsafe(sql)

        if(result){
            return result
        }else {
            return false
        }
    }catch(error){
        return false
    }
}
module.exports = {
    insertUsuario,
    updateUsuario,
    deleteUsuario,
    selectAllAnimal,
    selectByIdAnimal
}