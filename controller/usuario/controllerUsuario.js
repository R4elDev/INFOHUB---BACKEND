/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CRUD do usuario
 * Data ==> 18/09/2025
 * Autor ==> Israel
 ****************************************************************************/

// Import do arquivo de configuração para mensagens e status code
const MESSAGE = require('../../modulo/config.js')

// Import do DAO para realizar o CRUD no Banco de Dados
const usuarioDAO = require('../../model/DAO/usuario.js')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const loginUsuario = async function(usuario, contentType) {
    try {
      if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;
  
      const { email, senha } = usuario;
  
      if (!email || !senha) return MESSAGE.ERROR_REQUIRED_FIELDS;
  
      // Busca usuário no banco
      const resultUsuario = await usuarioDAO.findByEmail(email);
      if (!resultUsuario || resultUsuario.length === 0) return MESSAGE.ERROR_NOT_FOUND;
  
      // Valida senha
      const senhaValida = await bcrypt.compare(senha, resultUsuario.senha_hash);
      if (!senhaValida) return MESSAGE.ERROR_INVALID_CREDENTIALS;
  
      // Gera token JWT
      const token = jwt.sign(
        {
          id: resultUsuario.id_usuario,
          email: resultUsuario.email,
          perfil: resultUsuario.perfil
        },
        process.env.JWT_SECRET ,
        { expiresIn: "1h" } 
      );
  
      return {
        status: true,
        status_code: 200,
        token,
        usuario: {
          id: resultUsuario.id_usuario,
          nome: resultUsuario.nome,
          email: resultUsuario.email,
          perfil: resultUsuario.perfil
        }
      };
  
    } catch (error) {
      console.error(error);
      return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
}

const inserirUsuario = async function (usuario,contentType){
    try {
        if(contentType === 'application/json'){
            if(
                usuario.nome === undefined || usuario.nome === '' || usuario.nome === null || usuario.nome.length > 100 ||
                usuario.email === undefined || usuario.email === '' || usuario.email === null || usuario.email.length > 100 ||
                usuario.senha === undefined || usuario.senha === '' || usuario.senha === null || usuario.senha.length > 50 ||
                (usuario.perfil && !['consumidor','admin','estabelecimento'].includes(usuario.perfil))
            ){
                return MESSAGE.ERROR_REQUIRED_FIELDS
            } else {
                const senhaHash = await bcrypt.hash(usuario.senha, 10)
                usuario.senha_hash = senhaHash

                let resultUsuario = await usuarioDAO.insertUsuario(usuario)

                if(resultUsuario){
                    return MESSAGE.SUCCESS_CREATED_ITEM
                }else{
                    return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                }
            }
        }else{
            return MESSAGE.ERROR_CONTENT_TYPE
        }
    }catch (error){
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
} 

const atualizarUsuario = async function (usuario,id,contentType){
    try{
        if(contentType == 'application/json'){
            if(
                id            == undefined  || id           ==  ''  ||  id          == null   || isNaN(id)                     || id <= 0 ||
                usuario.nome  === undefined || usuario.nome === ''  || usuario.nome === null  || usuario.nome.length > 100     ||
                usuario.email === undefined || usuario.email === '' || usuario.email === null || usuario.email.length > 100    ||
                usuario.senha === undefined || usuario.senha === '' || usuario.senha === null || usuario.senha.length > 50     ||
                (usuario.perfil && !['consumidor','admin','estabelecimento'].includes(usuario.perfil))
            ){
                return MESSAGE.ERROR_REQUIRED_FIELDS
            }else{
                let resultUsuario = await buscarUsuario(parseInt(id))

                if(resultUsuario.status_code == 200){
                    usuario.id = parseInt(id)

                    let result = await usuarioDAO.updateUsuario(usuario)

                    if(result){
                        return MESSAGE.SUCCESS_UPDATED_ITEM
                    }else{
                        return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                    }
                }else if(resultUsuario.status_code == 400){
                    return MESSAGE.ERROR_NOT_FOUND
                }else{
                    return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
                }
            }
        }
    }catch(error){
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const excluirVersao = async function(id){
    try{
        if(id == '' || id == undefined || id == null || isNaN(id) || id <= 0){
            return MESSAGE.ERROR_REQUIRED_FIELDS
        }else{
            let resultUsuario = await buscarUsuario(parseInt(id))

            if(resultUsuario.status_code == 200){
                let result = await usuarioDAO.deleteUsuario(parseInt(id))

                if(result){
                    return MESSAGE.SUCCESS_DELETED_ITEM
                }else {
                    return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                }
            }else if( resultUsuario.status_code == 404){
                return MESSAGE.ERROR_NOT_FOUND
            }else{
                return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
            }

        }
    }catch(error){
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarPlataforma = async function(){
    try {
        const arrayUsuario = []
        const dadosUsuario = {}

        let resultUsuario = await usuarioDAO.selectAllUsuario()

        if(resultUsuario != false || typeof(resultUsuario) == 'object'){
            if(resultUsuario.length > 0){
                dadosUsuario.status = true
                dadosUsuario.status_code = 200
                dadosUsuario.items = resultUsuario.length
                dadosUsuario.usuarios = resultUsuario
            
                return dadosUsuario
            }else{
                return MESSAGE.ERROR_NOT_FOUND
            }
        }else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    }catch(error){
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarUsuario = async function(id) {
    try {
      let idUsuario = id
  
      if (id === '' || id === undefined || id === null || isNaN(id) || id <= 0) {
        return MESSAGE.ERROR_REQUIRED_FIELDS;
      } else {
        let dadosUsuario = {}
  
        let resultUsuario = await usuarioDAO.selectByIdUsuario(parseInt(idUsuario))
  
        if (resultUsuario != false || typeof(resultUsuario) === 'object') {
          if (resultUsuario.length > 0) {
            dadosUsuario.status = true
            dadosUsuario.status_code = 200
            dadosUsuario.versao = resultUsuario
  
            return dadosUsuario
          } else {
            return MESSAGE.ERROR_NOT_FOUND
          }
        }
      }
    } catch (error) {
      console.log(error)
      return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}
  


module.exports = {
    inserirUsuario,
    atualizarUsuario,
    excluirVersao,
    listarPlataforma
}
