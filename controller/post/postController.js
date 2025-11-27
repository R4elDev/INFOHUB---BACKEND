/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio dos POSTS
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const postDAO = require('../../model/DAO/post.js');
const notificacaoDAO = require('../../model/DAO/notificacao.js');

/**
 * CRIAR NOVO POST
 */
const criarPost = async function (dadosPost, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, conteudo, foto_url, imagem, id_produto, id_estabelecimento } = dadosPost;
        
        // Padronizar nome do campo para o DAO (aceitar tanto foto_url quanto imagem)
        if (foto_url && !imagem) {
            dadosPost.imagem = foto_url;
        }

        if (!id_usuario || !conteudo) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'conteudo' são obrigatórios."
            };
        }

        if (conteudo.length < 1 || conteudo.length > 500) {
            return {
                status: false,
                status_code: 400,
                message: "Conteúdo deve ter entre 1 e 500 caracteres."
            };
        }

        let resultPost = await postDAO.insertPost(dadosPost);

        if (resultPost) {
            return {
                status: true,
                status_code: 201,
                message: "Post criado com sucesso.",
                data: resultPost
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR POST:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR POST
 */
const atualizarPost = async function (dadosPost, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_post, conteudo } = dadosPost;

        if (!id_post) {
            return {
                status: false,
                status_code: 400,
                message: "Campo 'id_post' é obrigatório."
            };
        }

        // Verificar se o post existe
        let postExistente = await postDAO.selectPostById(id_post);
        if (!postExistente) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        // Validar conteúdo se fornecido
        if (conteudo && (conteudo.length < 1 || conteudo.length > 500)) {
            return {
                status: false,
                status_code: 400,
                message: "Conteúdo deve ter entre 1 e 500 caracteres."
            };
        }

        let resultUpdate = await postDAO.updatePost(dadosPost);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Post atualizado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR POST:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * DELETAR POST
 */
const deletarPost = async function (id_post) {
    try {
        if (!id_post) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_post' é obrigatório."
            };
        }

        // Verificar se o post existe
        let postExistente = await postDAO.selectPostById(id_post);
        if (!postExistente) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        let resultDelete = await postDAO.deletePost(id_post);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Post deletado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR POST:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * BUSCAR POST POR ID
 */
const buscarPostPorId = async function (id_post) {
    try {
        if (!id_post) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_post' é obrigatório."
            };
        }

        let resultPost = await postDAO.selectPostById(id_post);

        if (resultPost) {
            // Buscar comentários do post
            let comentarios = await postDAO.selectComentariosByPost(id_post);

            return {
                status: true,
                status_code: 200,
                message: "Post encontrado com sucesso.",
                data: {
                    post: resultPost,
                    comentarios: comentarios || []
                }
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER BUSCAR POST POR ID:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR POSTS DO USUÁRIO
 */
const listarPostsUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultPosts = await postDAO.selectPostsUsuario(id_usuario);

        if (resultPosts) {
            return {
                status: true,
                status_code: 200,
                message: "Posts do usuário encontrados com sucesso.",
                data: resultPosts
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum post encontrado.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR POSTS USUARIO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR TODOS OS POSTS (FEED)
 */
const listarTodosPosts = async function (limit = 20, offset = 0) {
    try {
        let resultPosts = await postDAO.selectAllPosts(limit);

        if (resultPosts) {
            return {
                status: true,
                status_code: 200,
                message: "Posts encontrados com sucesso.",
                data: resultPosts
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum post encontrado.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR TODOS POSTS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR FEED COM PAGINAÇÃO
 */
const listarFeed = async function (page = 1, limit = 20) {
    try {
        let resultPosts = await postDAO.getFeedPosts(limit);

        if (resultPosts) {
            return {
                status: true,
                status_code: 200,
                message: "Feed carregado com sucesso.",
                data: resultPosts,
                page: parseInt(page),
                limit: parseInt(limit)
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum post encontrado no feed.",
                data: [],
                page: parseInt(page),
                limit: parseInt(limit)
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR FEED:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR POSTS DE PRODUTO
 */
const listarPostsProduto = async function (id_produto) {
    try {
        if (!id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_produto' é obrigatório."
            };
        }

        let resultPosts = await postDAO.selectPostsByProduto(id_produto);

        if (resultPosts) {
            return {
                status: true,
                status_code: 200,
                message: "Posts do produto encontrados com sucesso.",
                data: resultPosts
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum post encontrado para este produto.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR POSTS PRODUTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR POSTS DE ESTABELECIMENTO
 */
const listarPostsEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let resultPosts = await postDAO.selectPostsByEstabelecimento(id_estabelecimento);

        if (resultPosts) {
            return {
                status: true,
                status_code: 200,
                message: "Posts do estabelecimento encontrados com sucesso.",
                data: resultPosts
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum post encontrado para este estabelecimento.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR POSTS ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * COMENTAR NO POST
 */
const comentarPost = async function (dadosComentario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_post, id_usuario, conteudo } = dadosComentario;

        if (!id_post || !id_usuario || !conteudo) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_post', 'id_usuario' e 'conteudo' são obrigatórios."
            };
        }

        if (conteudo.length < 1 || conteudo.length > 200) {
            return {
                status: false,
                status_code: 400,
                message: "Comentário deve ter entre 1 e 200 caracteres."
            };
        }

        // Verificar se o post existe
        let postExistente = await postDAO.selectPostById(id_post);
        if (!postExistente) {
            return {
                status: false,
                status_code: 404,
                message: "Post não encontrado."
            };
        }

        let resultComentario = await postDAO.adicionarComentario(dadosComentario);

        if (resultComentario) {
            // Notificar o dono do post (se não for ele mesmo comentando)
            if (postExistente.id_usuario != id_usuario) {
                await notificacaoDAO.notificarComentarioPost(
                    postExistente.id_usuario,
                    id_post,
                    resultComentario.nome_usuario
                );
            }

            return {
                status: true,
                status_code: 201,
                message: "Comentário adicionado com sucesso.",
                data: resultComentario
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER COMENTAR POST:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * LISTAR COMENTÁRIOS DE UM POST
 */
const listarComentarios = async function (id_post, page = null, limit = null) {
    try {
        if (!id_post) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_post' é obrigatório."
            };
        }

        let comentarios = await postDAO.selectComentariosByPost(id_post);

        return {
            status: true,
            status_code: 200,
            message: "Comentários encontrados com sucesso.",
            data: comentarios || []
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR COMENTÁRIOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * ATUALIZAR COMENTÁRIO
 */
const atualizarComentario = async function (dadosComentario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_comentario, conteudo } = dadosComentario;

        if (!id_comentario) {
            return {
                status: false,
                status_code: 400,
                message: "Campo 'id_comentario' é obrigatório."
            };
        }

        if (conteudo && (conteudo.length < 1 || conteudo.length > 200)) {
            return {
                status: false,
                status_code: 400,
                message: "Comentário deve ter entre 1 e 200 caracteres."
            };
        }

        let resultUpdate = await postDAO.updateComentario(dadosComentario);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Comentário atualizado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR COMENTÁRIO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * DELETAR COMENTÁRIO
 */
const deletarComentario = async function (id_comentario) {
    try {
        if (!id_comentario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_comentario' é obrigatório."
            };
        }

        let resultDelete = await postDAO.deleteComentario(id_comentario);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Comentário deletado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR COMENTÁRIO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * CURTIR/DESCURTIR POST
 */
const toggleCurtidaPost = async function (id_post, id_usuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!id_post || !id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_post' e 'id_usuario' são obrigatórios."
            };
        }

        // Verificar se o post existe
        let postExistente = await postDAO.selectPostById(id_post);
        if (!postExistente) {
            return {
                status: false,
                status_code: 404,
                message: "Post não encontrado."
            };
        }

        let resultCurtida = await postDAO.toggleCurtida(id_post, id_usuario);

        if (resultCurtida) {
            // Notificar o dono do post (se não for ele mesmo curtindo)
            if (resultCurtida.curtido && postExistente.id_usuario != id_usuario) {
                await notificacaoDAO.notificarCurtidaPost(
                    postExistente.id_usuario,
                    id_post
                );
            }

            // Contar total de curtidas
            let totalCurtidas = await postDAO.countCurtidasPost(id_post);

            return {
                status: true,
                status_code: 200,
                message: `Curtida ${resultCurtida.acao} com sucesso.`,
                data: {
                    curtido: resultCurtida.curtido,
                    total_curtidas: totalCurtidas
                }
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_MODEL;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CURTIR POST:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

/**
 * VERIFICAR SE USUÁRIO CURTIU POST
 */
const verificarCurtidaUsuario = async function (id_post, id_usuario) {
    try {
        if (!id_post || !id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_post' e 'id_usuario' são obrigatórios."
            };
        }

        let curtido = await postDAO.verificarCurtidaUsuario(id_post, id_usuario);
        let totalCurtidas = await postDAO.countCurtidasPost(id_post);

        return {
            status: true,
            status_code: 200,
            message: "Verificação realizada com sucesso.",
            data: {
                curtido: curtido,
                total_curtidas: totalCurtidas
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER VERIFICAR CURTIDA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER_CONTROLLER;
    }
};

module.exports = {
    criarPost,
    atualizarPost,
    deletarPost,
    buscarPostPorId,
    listarPostsUsuario,
    listarTodosPosts,
    listarFeed,
    listarPostsProduto,
    listarPostsEstabelecimento,
    comentarPost,
    listarComentarios,
    atualizarComentario,
    deletarComentario,
    toggleCurtidaPost,
    verificarCurtidaUsuario
};
