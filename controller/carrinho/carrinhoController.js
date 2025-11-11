/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio do CARRINHO DE COMPRAS
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const carrinhoDAO = require('../../model/DAO/carrinho.js');

/**
 * ADICIONAR ITEM AO CARRINHO
 */
const adicionarItemCarrinho = async function (dadosItem, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_produto, quantidade } = dadosItem;

        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        if (quantidade && quantidade <= 0) {
            return {
                status: false,
                status_code: 400,
                message: "Quantidade deve ser maior que zero."
            };
        }

        let resultItem = await carrinhoDAO.insertItemCarrinho(dadosItem);

        if (resultItem) {
            return {
                status: true,
                status_code: 201,
                message: "Item adicionado ao carrinho com sucesso.",
                data: resultItem
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ADICIONAR ITEM CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR QUANTIDADE ITEM CARRINHO
 */
const atualizarItemCarrinho = async function (dadosItem, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_produto, quantidade } = dadosItem;

        if (!id_usuario || !id_produto || !quantidade) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario', 'id_produto' e 'quantidade' são obrigatórios."
            };
        }

        if (quantidade <= 0) {
            return {
                status: false,
                status_code: 400,
                message: "Quantidade deve ser maior que zero."
            };
        }

        let resultUpdate = await carrinhoDAO.updateItemCarrinho(dadosItem);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Quantidade do item atualizada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR ITEM CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * REMOVER ITEM DO CARRINHO
 */
const removerItemCarrinho = async function (id_usuario, id_produto) {
    try {
        if (!id_usuario || !id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_usuario' e 'id_produto' são obrigatórios."
            };
        }

        let resultDelete = await carrinhoDAO.deleteItemCarrinho(id_usuario, id_produto);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Item removido do carrinho com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER REMOVER ITEM CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR CARRINHO DO USUÁRIO
 */
const listarCarrinhoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultCarrinho = await carrinhoDAO.selectCarrinhoUsuario(id_usuario);
        let contador = await carrinhoDAO.countItensCarrinho(id_usuario);
        let valorTotal = await carrinhoDAO.calcularTotalCarrinho(id_usuario);

        if (resultCarrinho) {
            return {
                status: true,
                status_code: 200,
                message: "Carrinho encontrado com sucesso.",
                data: {
                    itens: resultCarrinho,
                    resumo: {
                        total_itens: contador.total_itens,
                        total_produtos: contador.total_produtos,
                        valor_total: parseFloat(valorTotal).toFixed(2)
                    }
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Carrinho vazio.",
                data: {
                    itens: [],
                    resumo: {
                        total_itens: 0,
                        total_produtos: 0,
                        valor_total: "0.00"
                    }
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LIMPAR CARRINHO DO USUÁRIO
 */
const limparCarrinhoUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultLimpar = await carrinhoDAO.clearCarrinhoUsuario(id_usuario);

        if (resultLimpar) {
            return {
                status: true,
                status_code: 200,
                message: "Carrinho limpo com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LIMPAR CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CONTAR ITENS DO CARRINHO
 */
const contarItensCarrinho = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let contador = await carrinhoDAO.countItensCarrinho(id_usuario);

        return {
            status: true,
            status_code: 200,
            message: "Contagem realizada com sucesso.",
            data: contador
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER CONTAR ITENS CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CALCULAR TOTAL DO CARRINHO
 */
const calcularTotalCarrinho = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let valorTotal = await carrinhoDAO.calcularTotalCarrinho(id_usuario);

        return {
            status: true,
            status_code: 200,
            message: "Total calculado com sucesso.",
            data: {
                valor_total: parseFloat(valorTotal).toFixed(2)
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER CALCULAR TOTAL CARRINHO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    adicionarItemCarrinho,
    atualizarItemCarrinho,
    removerItemCarrinho,
    listarCarrinhoUsuario,
    limparCarrinhoUsuario,
    contarItensCarrinho,
    calcularTotalCarrinho
};