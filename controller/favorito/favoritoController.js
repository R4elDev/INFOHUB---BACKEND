/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio dos FAVORITOS
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const favoritoDAO = require('../../model/DAO/favorito.js');

/**
 * ADICIONAR PRODUTO AOS FAVORITOS
 */
const adicionarFavorito = async function (dadosFavorito, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_produto } = dadosFavorito;

        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        let resultFavorito = await favoritoDAO.insertFavorito(dadosFavorito);

        if (resultFavorito && resultFavorito.exists) {
            return {
                status: false,
                status_code: 409,
                message: "Este produto já está nos seus favoritos."
            };
        }

        if (resultFavorito) {
            return {
                status: true,
                status_code: 201,
                message: "Produto adicionado aos favoritos com sucesso.",
                data: resultFavorito
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ADICIONAR FAVORITO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * REMOVER PRODUTO DOS FAVORITOS
 */
const removerFavorito = async function (id_usuario, id_produto) {
    try {
        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        let resultDelete = await favoritoDAO.deleteFavorito(id_usuario, id_produto);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Produto removido dos favoritos com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER REMOVER FAVORITO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ALTERNAR FAVORITO (adiciona se não existe, remove se existe)
 */
const alternarFavorito = async function (dadosFavorito, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_produto } = dadosFavorito;

        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        let resultToggle = await favoritoDAO.toggleFavorito(id_usuario, id_produto);

        if (resultToggle.success) {
            const message = resultToggle.action === 'added' 
                ? "Produto adicionado aos favoritos." 
                : "Produto removido dos favoritos.";
            
            return {
                status: true,
                status_code: 200,
                message: message,
                data: {
                    action: resultToggle.action,
                    is_favorito: resultToggle.action === 'added'
                }
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ALTERNAR FAVORITO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR FAVORITOS DO USUÁRIO
 */
const listarFavoritosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultFavoritos = await favoritoDAO.selectFavoritosUsuario(id_usuario);
        let totalFavoritos = await favoritoDAO.countFavoritosUsuario(id_usuario);

        if (resultFavoritos) {
            return {
                status: true,
                status_code: 200,
                message: "Favoritos encontrados com sucesso.",
                data: {
                    favoritos: resultFavoritos,
                    total_favoritos: totalFavoritos
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum favorito encontrado.",
                data: {
                    favoritos: [],
                    total_favoritos: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR FAVORITOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * VERIFICAR SE PRODUTO É FAVORITO
 */
const verificarFavorito = async function (id_usuario, id_produto) {
    try {
        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        let isFavorito = await favoritoDAO.checkIsFavorito(id_usuario, id_produto);

        return {
            status: true,
            status_code: 200,
            message: "Verificação realizada com sucesso.",
            data: {
                is_favorito: isFavorito
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER VERIFICAR FAVORITO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR FAVORITOS EM PROMOÇÃO
 */
const listarFavoritosEmPromocao = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultPromocoes = await favoritoDAO.selectFavoritosEmPromocao(id_usuario);

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Favoritos em promoção encontrados com sucesso.",
                data: {
                    promocoes: resultPromocoes,
                    total_promocoes: resultPromocoes.length
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum favorito em promoção no momento.",
                data: {
                    promocoes: [],
                    total_promocoes: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER FAVORITOS EM PROMOÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR PRODUTOS MAIS FAVORITADOS
 */
const listarProdutosMaisFavoritados = async function (limit) {
    try {
        const limitePadrao = limit || 10;

        let resultProdutos = await favoritoDAO.selectProdutosMaisFavoritados(limitePadrao);

        if (resultProdutos) {
            return {
                status: true,
                status_code: 200,
                message: "Produtos mais favoritados encontrados com sucesso.",
                data: resultProdutos
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum produto favoritado encontrado.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER PRODUTOS MAIS FAVORITADOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CONTAR FAVORITOS DO USUÁRIO
 */
const contarFavoritosUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let totalFavoritos = await favoritoDAO.countFavoritosUsuario(id_usuario);

        return {
            status: true,
            status_code: 200,
            message: "Contagem realizada com sucesso.",
            data: {
                total_favoritos: totalFavoritos
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER CONTAR FAVORITOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    adicionarFavorito,
    removerFavorito,
    alternarFavorito,
    listarFavoritosUsuario,
    verificarFavorito,
    listarFavoritosEmPromocao,
    listarProdutosMaisFavoritados,
    contarFavoritosUsuario
};