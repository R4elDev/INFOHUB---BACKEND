/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio das COMPRAS
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const compraDAO = require('../../model/DAO/compra.js');
const carrinhoDAO = require('../../model/DAO/carrinho.js');
const notificacaoDAO = require('../../model/DAO/notificacao.js');

/**
 * PROCESSAR COMPRA DO CARRINHO
 */
const processarCompraCarrinho = async function (dadosCompra, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_estabelecimento, metodo_pagamento, dados_cartao } = dadosCompra;

        if (!id_usuario || !id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'id_estabelecimento' são obrigatórios."
            };
        }

        // Buscar dados do usuário para obter email (necessário para Stripe)
        const usuarioDAO = require('../../model/DAO/usuario.js');
        const usuario = await usuarioDAO.selectUsuarioById(id_usuario);
        if (!usuario) {
            return {
                status: false,
                status_code: 404,
                message: "Usuário não encontrado."
            };
        }

        // Verificar se há itens no carrinho
        let carrinho = await carrinhoDAO.selectCarrinhoUsuario(id_usuario);
        if (!carrinho || carrinho.length === 0) {
            return {
                status: false,
                status_code: 400,
                message: "Carrinho vazio. Adicione produtos antes de finalizar a compra."
            };
        }

        // Calcular valor total
        let valorTotal = await carrinhoDAO.calcularTotalCarrinho(id_usuario);

        const dadosCompraCompleta = {
            id_usuario,
            id_estabelecimento,
            valor_total: valorTotal,
            metodo_pagamento,
            dados_cartao,
            email_cliente: usuario.email,
            status_compra: 'pendente'
        };

        // Usar service para processar compra com integração Stripe
        const compraService = require('../../services/compraService.js');
        let resultCompra = await compraService.processarCompraCompleta(dadosCompraCompleta);

        if (resultCompra.success) {
            return {
                status: true,
                status_code: 201,
                message: resultCompra.message,
                data: {
                    compra: resultCompra.compra,
                    pagamento: resultCompra.pagamento,
                    taxas: resultCompra.taxas,
                    dados_pix: resultCompra.pagamento?.qr_code ? {
                        qr_code: resultCompra.pagamento.qr_code,
                        expires_at: resultCompra.pagamento.expires_at
                    } : null
                }
            };
        } else {
            return {
                status: false,
                status_code: 400,
                message: resultCompra.message,
                detalhes: resultCompra.detalhes || null
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER PROCESSAR COMPRA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CRIAR COMPRA MANUAL (para administradores)
 */
const criarCompra = async function (dadosCompra, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_estabelecimento, valor_total, status_compra, metodo_pagamento } = dadosCompra;

        if (!id_usuario || !id_estabelecimento || !valor_total) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario', 'id_estabelecimento' e 'valor_total' são obrigatórios."
            };
        }

        if (valor_total <= 0) {
            return {
                status: false,
                status_code: 400,
                message: "Valor total deve ser maior que zero."
            };
        }

        let resultCompra = await compraDAO.insertCompra(dadosCompra);

        if (resultCompra) {
            return {
                status: true,
                status_code: 201,
                message: "Compra criada com sucesso.",
                data: resultCompra
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR COMPRA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR STATUS DA COMPRA
 */
const atualizarStatusCompra = async function (id_compra, novoStatus, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!id_compra || !novoStatus) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_compra' e 'status' são obrigatórios."
            };
        }

        const statusValidos = ['pendente', 'confirmada', 'processando', 'enviada', 'entregue', 'cancelada'];
        if (!statusValidos.includes(novoStatus)) {
            return {
                status: false,
                status_code: 400,
                message: "Status inválido. Use: " + statusValidos.join(', ')
            };
        }

        // Buscar dados da compra para notificação
        let compra = await compraDAO.selectCompraById(id_compra);
        if (!compra) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        let resultUpdate = await compraDAO.updateStatusCompra(id_compra, novoStatus);

        if (resultUpdate) {
            // Enviar notificação de mudança de status
            await notificacaoDAO.notificarStatusCompra(
                compra.id_usuario,
                id_compra,
                novoStatus
            );

            return {
                status: true,
                status_code: 200,
                message: "Status da compra atualizado com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR STATUS COMPRA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR COMPRAS DO USUÁRIO
 */
const listarComprasUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultCompras = await compraDAO.selectComprasUsuario(id_usuario);

        if (resultCompras) {
            return {
                status: true,
                status_code: 200,
                message: "Compras encontradas com sucesso.",
                data: resultCompras
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma compra encontrada.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR COMPRAS USUARIO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * BUSCAR COMPRA POR ID
 */
const buscarCompraPorId = async function (id_compra) {
    try {
        if (!id_compra) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_compra' é obrigatório."
            };
        }

        let resultCompra = await compraDAO.selectCompraById(id_compra);
        let itensCompra = await compraDAO.selectItensCompra(id_compra);

        if (resultCompra) {
            return {
                status: true,
                status_code: 200,
                message: "Compra encontrada com sucesso.",
                data: {
                    compra: resultCompra,
                    itens: itensCompra || []
                }
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER BUSCAR COMPRA POR ID:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR TODAS AS COMPRAS (para administradores)
 */
const listarTodasCompras = async function () {
    try {
        let resultCompras = await compraDAO.selectAllCompras();

        if (resultCompras) {
            return {
                status: true,
                status_code: 200,
                message: "Compras encontradas com sucesso.",
                data: resultCompras
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma compra encontrada.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR TODAS COMPRAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR COMPRAS POR STATUS
 */
const listarComprasPorStatus = async function (status) {
    try {
        if (!status) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'status' é obrigatório."
            };
        }

        const statusValidos = ['pendente', 'confirmada', 'processando', 'enviada', 'entregue', 'cancelada'];
        if (!statusValidos.includes(status)) {
            return {
                status: false,
                status_code: 400,
                message: "Status inválido. Use: " + statusValidos.join(', ')
            };
        }

        let resultCompras = await compraDAO.selectComprasByStatus(status);

        if (resultCompras) {
            return {
                status: true,
                status_code: 200,
                message: `Compras com status '${status}' encontradas com sucesso.`,
                data: resultCompras
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: `Nenhuma compra com status '${status}' encontrada.`,
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR COMPRAS POR STATUS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CANCELAR COMPRA
 */
const cancelarCompra = async function (id_compra, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!id_compra) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_compra' é obrigatório."
            };
        }

        // Buscar compra para verificar status atual
        let compra = await compraDAO.selectCompraById(id_compra);
        if (!compra) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        if (compra.status_compra === 'entregue') {
            return {
                status: false,
                status_code: 400,
                message: "Não é possível cancelar uma compra já entregue."
            };
        }

        if (compra.status_compra === 'cancelada') {
            return {
                status: false,
                status_code: 400,
                message: "Esta compra já foi cancelada."
            };
        }

        let resultUpdate = await compraDAO.updateStatusCompra(id_compra, 'cancelada');

        if (resultUpdate) {
            // Notificar cancelamento
            await notificacaoDAO.notificarStatusCompra(
                compra.id_usuario,
                id_compra,
                'cancelada'
            );

            return {
                status: true,
                status_code: 200,
                message: "Compra cancelada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CANCELAR COMPRA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    processarCompraCarrinho,
    criarCompra,
    atualizarStatusCompra,
    listarComprasUsuario,
    buscarCompraPorId,
    listarTodasCompras,
    listarComprasPorStatus,
    cancelarCompra
};