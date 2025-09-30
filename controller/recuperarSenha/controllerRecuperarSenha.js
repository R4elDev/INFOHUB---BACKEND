/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio da recuperação de senha
 * Data ==> 25/09/2025
 * Autor ==> Israel
 ****************************************************************************/

// Import do arquivo de configuração para mensagens e status code
const MESSAGE = require('../../modulo/config.js')

// Import do DAO para realizar o CRUD no Banco de Dados
const recuperacaoDAO = require('../../model/DAO/recuperacaoSenha.js')
const usuarioDAO = require('../../model/DAO/usuario.js')
const bcrypt = require('bcryptjs')
const {enviarEmailDeRecuperacao}  = require('../../services/emailService.js')

// SOLICITAR RECUPERAÇAO

const solicitarRecuperacao = async function (usuario,contentType){
    try{
        if(contentType !== 'application/json'){
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if(!usuario.email || usuario.email === ''){
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        let resultUsuario = await usuarioDAO.selectByEmailUsuario(usuario.email)

        if(!resultUsuario){
            return MESSAGE.ERROR_NOT_FOUND
        }


        let codigo = Math.floor(1000 + Math.random() * 9000).toString();
        let expiracao = new Date(Date.now() + 15 * 60 * 1000) // Vai expirar em 15 minutos

        let resultRecuperacao = await recuperacaoDAO.insertRecuperacao(resultUsuario.id_usuario,codigo,expiracao)

        if(resultRecuperacao){
            await enviarEmailDeRecuperacao(resultUsuario.email, codigo)
            return MESSAGE.SUCCESS_RECOVERT_EMAIL_SENT
        }else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }

    }catch(error){
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const validarCodigo = async function (dados,contentType){
    try{    
        if(contentType !== 'application/json'){
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if(!dados.codigo || dados.codigo === ''){
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        let registro = await recuperacaoDAO.selectByCodigo(dados.codigo)
        if(!registro){
            return MESSAGE.ERROR_INVALID_CODE
        }

        if(new Date(registro.expiracao) < new Date()){
            return MESSAGE.ERROR_CODE_EXPIRED
        }

        return {
            status: true,
            status_code: 200,
            id_usuario: registro.id_usuario,
            message: "Código válido"
        }
    }catch(error){
        console.log("ERRO NO METODO VALIDAR CODIGO",error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const redefinirSenha = async function( dados, contentType){
    try{
        if(contentType !== 'application/json'){
            return MESSAGE.ERROR_CONTENT_TYPE
        }

        if(!dados.codigo || !dados.novaSenha){
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }

        let registro = await recuperacaoDAO.selectByCodigo(dados.codigo)
        if(!registro){
            return MESSAGE.ERROR_INVALID_CODE
        }
        if(new Date(registro.expiracao) < new Date()){
            return MESSAGE.ERROR_CODE_EXPIRED
        }

        // CripTografando a nova senha

        console.log(registro)
        let senhaHash = await bcrypt.hash(dados.novaSenha,10)
        let resulUpdate = await usuarioDAO.updateSenha(registro.id_usuario,senhaHash)

        if(resulUpdate){
            await recuperacaoDAO.marcarComoUsado(registro.id)
            return MESSAGE.SUCCESS_PASSWORD_RESET
        }else{
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    }catch(error){
        console.log("ERRO NO REDEFINIR SENHA --> ", error )
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    solicitarRecuperacao,
    validarCodigo,
    redefinirSenha
}