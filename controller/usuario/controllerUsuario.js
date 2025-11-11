/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CRUD do usuario
 * Data ==> 18/09/2025
 * Autor ==> Israel
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const usuarioDAO = require('../../model/DAO/usuario.js');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


/**
 * LOGIN
 */
const loginUsuario = async function (usuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { email, senha } = usuario;

        if (!email || !senha) {
            return MESSAGE.ERROR_REQUIRED_FIELDS;
        }

        let resultUsuario = await usuarioDAO.selectByEmailUsuario(email);

        if (!resultUsuario) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        const senhaValida = await bcrypt.compare(senha, resultUsuario.senha_hash);

        if (!senhaValida) {
            return MESSAGE.ERROR_INVALID_CREDENTIALS;
        }

        const token = jwt.sign(
            {
                id: resultUsuario.id_usuario,
                email: resultUsuario.email,
                perfil: resultUsuario.perfil
            },
            process.env.JWT_SECRET,
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
};

/**
 * INSERIR
 */
const inserirUsuario = async function (usuario, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        // Validação de campos obrigatórios
        if (
            !usuario.nome || usuario.nome.length > 100 ||
            !usuario.email || usuario.email.length > 150 ||
            !usuario.senha_hash || usuario.senha_hash.length > 100 ||
            (usuario.perfil && !['consumidor', 'admin', 'estabelecimento'].includes(usuario.perfil)) ||
            (usuario.cpf && usuario.cpf.length > 100) ||
            (usuario.cnpj && usuario.cnpj.length > 100) ||
            (usuario.telefone && usuario.telefone.length > 20) ||
            (usuario.data_nascimento && usuario.data_nascimento.length > 100)
        ) return MESSAGE.ERROR_REQUIRED_FIELDS;

        usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);

        let resultUsuario = await usuarioDAO.insertUsuario(usuario);

        if (resultUsuario) {
            return {
                status: true,
                status_code: 200,
                message: 'Usuário criado com sucesso!',
                usuario: resultUsuario
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.log(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * ATUALIZAR - Atualização parcial e opcional
 */
const atualizarUsuario = async function (usuario, id, contentType) {
    try {
        if (contentType !== 'application/json') return MESSAGE.ERROR_CONTENT_TYPE;

        // Validar apenas o ID (obrigatório para atualização)
        if (!id || isNaN(id) || id <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        // Verificar se usuário existe
        let resultUsuario = await buscarUsuario(parseInt(id));
        if (resultUsuario.status_code !== 200) return resultUsuario;

        // Objeto para armazenar apenas campos válidos a serem atualizados
        let dadosAtualizacao = { id_usuario: parseInt(id) };

        // Validar e preparar campos APENAS se forem enviados
        if (usuario.nome !== undefined) {
            if (!usuario.nome || usuario.nome.length > 100) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'Nome deve ter entre 1 e 100 caracteres'
                };
            }
            dadosAtualizacao.nome = usuario.nome;
        }

        if (usuario.email !== undefined) {
            if (!usuario.email || usuario.email.length > 150) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'Email deve ter entre 1 e 150 caracteres'
                };
            }
            dadosAtualizacao.email = usuario.email;
        }

        if (usuario.senha !== undefined) {
            if (!usuario.senha || usuario.senha.length < 6 || usuario.senha.length > 100) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'Senha deve ter entre 6 e 100 caracteres'
                };
            }
            // Hash da nova senha
            dadosAtualizacao.senha_hash = await bcrypt.hash(usuario.senha, 10);
        }

        if (usuario.perfil !== undefined) {
            if (!['consumidor', 'admin', 'estabelecimento'].includes(usuario.perfil)) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'Perfil deve ser: consumidor, admin ou estabelecimento'
                };
            }
            dadosAtualizacao.perfil = usuario.perfil;
        }

        if (usuario.cpf !== undefined) {
            if (usuario.cpf && usuario.cpf.length > 100) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'CPF deve ter no máximo 100 caracteres'
                };
            }
            dadosAtualizacao.cpf = usuario.cpf;
        }

        if (usuario.cnpj !== undefined) {
            if (usuario.cnpj && usuario.cnpj.length > 100) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'CNPJ deve ter no máximo 100 caracteres'
                };
            }
            dadosAtualizacao.cnpj = usuario.cnpj;
        }

        if (usuario.telefone !== undefined) {
            if (usuario.telefone && usuario.telefone.length > 20) {
                return {
                    status: false,
                    status_code: 400,
                    message: 'Telefone deve ter no máximo 20 caracteres'
                };
            }
            dadosAtualizacao.telefone = usuario.telefone;
        }

        if (usuario.data_nascimento !== undefined) {
            dadosAtualizacao.data_nascimento = usuario.data_nascimento;
        }

        // Verificar se pelo menos um campo foi enviado para atualização
        if (Object.keys(dadosAtualizacao).length === 1) { // Só tem o id_usuario
            return {
                status: false,
                status_code: 400,
                message: 'Nenhum campo válido foi enviado para atualização'
            };
        }

        // Executar atualização apenas com campos enviados
        let result = await usuarioDAO.updateUsuario(dadosAtualizacao);

        if (result) {
            // Buscar dados atualizados para retornar
            let usuarioAtualizado = await buscarUsuario(parseInt(id));
            
            return {
                status: true,
                status_code: 200,
                message: 'Usuário atualizado com sucesso!',
                usuario: usuarioAtualizado.usuario,
                campos_atualizados: Object.keys(dadosAtualizacao).filter(key => key !== 'id_usuario')
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.log(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * EXCLUIR
 */
const excluirUsuario = async function (id) {
    try {
        if (!id || isNaN(id) || id <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultUsuario = await buscarUsuario(parseInt(id));
        if (resultUsuario.status_code !== 200) return resultUsuario;

        let result = await usuarioDAO.deleteUsuario(parseInt(id));

        if (result) {
            return {
                status: true,
                status_code: 200,
                message: 'Usuário excluído com sucesso!'
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.log(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR TODOS
 */
const listarUsuarios = async function () {
    try {
        let resultUsuario = await usuarioDAO.selectAllUsuario();

        if (resultUsuario && typeof resultUsuario === 'object' && resultUsuario.length > 0) {
            return {
                status: true,
                status_code: 200,
                items: resultUsuario.length,
                usuarios: resultUsuario
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * BUSCAR POR ID
 */
const buscarUsuario = async function (id) {
    try {
        if (!id || isNaN(id) || id <= 0) return MESSAGE.ERROR_REQUIRED_FIELDS;

        let resultUsuario = await usuarioDAO.selectByIdUsuario(parseInt(id));

        if (resultUsuario) {
            return {
                status: true,
                status_code: 200,
                usuario: resultUsuario
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log(error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

module.exports = {
    inserirUsuario,
    atualizarUsuario,
    excluirUsuario,
    listarUsuarios,
    buscarUsuario,
    loginUsuario
};