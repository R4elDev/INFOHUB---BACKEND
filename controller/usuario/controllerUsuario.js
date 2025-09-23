/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CRUD do usuario
 * Data ==> 18/09/2025
 * Autor ==> Israel
 ****************************************************************************/

// Import do arquivo de configuração para mensagens e status code
const MESSAGE = require('../../modulo/config.js')

// Import do DAO para realizar o CRUD no Banco de Dados
const usuarioDAO = require('../../model/DAO/usuario.js')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

/**
 * LOGIN
 */
const loginUsuario = async function (usuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE
        } else {
            const { email, senha } = usuario

            if (!email || !senha) {
                return MESSAGE.ERROR_REQUIRED_FIELDS
            } else {
                let resultUsuario = await usuarioDAO.selectByEmailUsuario(email)

                if (!resultUsuario || resultUsuario.length === 0) {
                    return MESSAGE.ERROR_NOT_FOUND
                } else {
                    const senhaValida = await bcrypt.compare(senha, resultUsuario.senha_hash)

                    if (!senhaValida) {
                        return MESSAGE.ERROR_INVALID_CREDENTIALS
                    } else {
                        const token = jwt.sign(
                            {
                                id: resultUsuario.id_usuario,
                                email: resultUsuario.email,
                                perfil: resultUsuario.perfil
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: "1h" }
                        )

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
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/**
 * INSERIR
 */
const inserirUsuario = async function (usuario, contentType) {
    try {
        if (contentType === 'application/json') {

            
            if (usuario.cpf === undefined) usuario.cpf = null
            if (usuario.cnpj === undefined) usuario.cnpj = null

            if (
                usuario.nome        == undefined || usuario.nome        == '' || usuario.nome        == null || usuario.nome.length        > 100 ||
                usuario.email       == undefined || usuario.email       == '' || usuario.email       == null || usuario.email.length       > 150 ||
                usuario.senha_hash  == undefined || usuario.senha_hash  == '' || usuario.senha_hash  == null || usuario.senha_hash.length  > 100 ||
                (usuario.perfil && !['consumidor', 'admin', 'estabelecimento'].includes(usuario.perfil)) ||
                (usuario.cpf     != null              && usuario.cpf.length  > 100) ||
                (usuario.cnpj    != null              && usuario.cnpj.length > 100) ||
                usuario.telefone == undefined              && usuario.telefone.length > 20 ||
                usuario.data_nascimento  == undefined || usuario.data_nascimento.length > 100
            ) {
                return MESSAGE.ERROR_REQUIRED_FIELDS
            } else {
                usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10)

                let resultUsuario = await usuarioDAO.insertUsuario(usuario)

                if (resultUsuario) {
                    return MESSAGE.SUCCESS_CREATED_ITEM
                } else {
                    return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                }
            }
        } else {
            return MESSAGE.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}


/**
 * ATUALIZAR
 */
const atualizarUsuario = async function (usuario, id, contentType) {
    try {
        if (contentType === 'application/json') {
            if (
                id                       == undefined || id             == '' || id             == null || isNaN(id) || id      <= 0   ||
                usuario.nome             == undefined || usuario.nome                             == '' || usuario.nome     == null || usuario.nome.length     > 100 ||
                usuario.email            == undefined || usuario.email                            == '' || usuario.email    == null || usuario.email.length    > 150 ||
                usuario.senha            == undefined || usuario.senha                            == '' || usuario.senha    == null || usuario.senha.length    > 100 ||
                usuario.perfil && !['consumidor', 'admin', 'estabelecimento'].includes(usuario.perfil) ||
                usuario.cpf              == undefined ||  usuario.cpf.length             > 100  ||
                usuario.cnpj             == undefined ||  usuario.cnpj.length            > 100 ||
                usuario.telefone         == undefined       && usuario.telefone.length > 20 ||
                usuario.data_nascimento  == undefined ||  usuario.data_nascimento.length > 100
            ) {
                return MESSAGE.ERROR_REQUIRED_FIELDS
            } else {
                let resultUsuario = await buscarUsuario(parseInt(id))

                if (resultUsuario.status_code === 200) {
                    usuario.id_usuario = parseInt(id)
                    usuario.senha_hash = await bcrypt.hash(usuario.senha, 10)

                    let result = await usuarioDAO.updateUsuario(usuario)

                    if (result) {
                        return MESSAGE.SUCCESS_UPDATED_ITEM
                    } else {
                        return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                    }
                } else if (resultUsuario.status_code === 404) {
                    return MESSAGE.ERROR_NOT_FOUND
                } else {
                    return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
                }
            }
        } else {
            return MESSAGE.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/**
 * EXCLUIR
 */
const excluirUsuario = async function (id) {
    try {
        if (id == '' || id == undefined || id == null || isNaN(id) || id <= 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        } else {
            let resultUsuario = await buscarUsuario(parseInt(id))

            if (resultUsuario.status_code === 200) {
                let result = await usuarioDAO.deleteUsuario(parseInt(id))

                if (result) {
                    return MESSAGE.SUCCESS_DELETED_ITEM
                } else {
                    return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
                }
            } else if (resultUsuario.status_code === 404) {
                return MESSAGE.ERROR_NOT_FOUND
            } else {
                return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
            }
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/**
 * LISTAR TODOS
 */
const listarUsuarios = async function () {
    try {
        let resultUsuario = await usuarioDAO.selectAllUsuario()

        if (resultUsuario != false || typeof (resultUsuario) == 'object') {
            if (resultUsuario.length > 0) {
                return {
                    status: true,
                    status_code: 200,
                    items: resultUsuario.length,
                    usuarios: resultUsuario
                }
            } else {
                return MESSAGE.ERROR_NOT_FOUND
            }
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/**
 * BUSCAR POR ID
 */
const buscarUsuario = async function (id) {
    try {
        if (id === '' || id === undefined || id === null || isNaN(id) || id <= 0) {
            return MESSAGE.ERROR_REQUIRED_FIELDS
        } else {
            let resultUsuario = await usuarioDAO.selectByIdUsuario(parseInt(id))

            if (resultUsuario != false || typeof (resultUsuario) === 'object') {
                if (resultUsuario.length > 0) {
                    return {
                        status: true,
                        status_code: 200,
                        usuario: resultUsuario[0]
                    }
                } else {
                    return MESSAGE.ERROR_NOT_FOUND
                }
            } else {
                return MESSAGE.ERROR_INTERNAL_SERVER_MODEL
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
    excluirUsuario,
    listarUsuarios,
    buscarUsuario,
    loginUsuario
}
