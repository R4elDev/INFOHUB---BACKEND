/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente as NOTIFICAÇÕES no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT NOTIFICAÇÃO =================================
const insertNotificacao = async function (notificacao) {
    try {
        let sql = `
            INSERT INTO tbl_notificacao (
                id_usuario, mensagem, tipo
            ) VALUES (
                ${notificacao.id_usuario},
                '${notificacao.mensagem}',
                '${notificacao.tipo}'
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT * FROM tbl_notificacao 
                WHERE id_usuario = ${notificacao.id_usuario}
                ORDER BY id_notificacao DESC 
                LIMIT 1
            `;
            let notificacaoCriada = await prisma.$queryRawUnsafe(sqlSelect);
            return notificacaoCriada[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR NOTIFICAÇÃO:", error);
        return false;
    }
};

// ================================ UPDATE NOTIFICAÇÃO (MARCAR COMO LIDA) =================================
const marcarComoLida = async function (id_notificacao) {
    try {
        let sql = `
            UPDATE tbl_notificacao 
            SET lida = TRUE 
            WHERE id_notificacao = ${id_notificacao}
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO MARCAR NOTIFICAÇÃO COMO LIDA:", error);
        return false;
    }
};

// ================================ MARCAR TODAS COMO LIDAS =================================
const marcarTodasComoLidas = async function (id_usuario) {
    try {
        let sql = `
            UPDATE tbl_notificacao 
            SET lida = TRUE 
            WHERE id_usuario = ${id_usuario} AND lida = FALSE
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO MARCAR TODAS NOTIFICAÇÕES COMO LIDAS:", error);
        return false;
    }
};

// ================================ DELETE NOTIFICAÇÃO =================================
const deleteNotificacao = async function (id_notificacao) {
    try {
        let sql = `DELETE FROM tbl_notificacao WHERE id_notificacao = ${id_notificacao}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR NOTIFICAÇÃO:", error);
        return false;
    }
};

// ================================ DELETE NOTIFICAÇÕES ANTIGAS =================================
const deleteNotificacaoesAntigas = async function (diasAntigos = 30) {
    try {
        let sql = `
            DELETE FROM tbl_notificacao 
            WHERE data_envio < DATE_SUB(NOW(), INTERVAL ${diasAntigos} DAY)
        `;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR NOTIFICAÇÕES ANTIGAS:", error);
        return false;
    }
};

// ================================ SELECT NOTIFICAÇÕES BY USER =================================
const selectNotificacaoesUsuario = async function (id_usuario, limit = 20) {
    try {
        let sql = `
            SELECT 
                *,
                CASE 
                    WHEN TIMESTAMPDIFF(MINUTE, data_envio, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, data_envio, NOW()), ' min atrás')
                    WHEN TIMESTAMPDIFF(HOUR, data_envio, NOW()) < 24 
                    THEN CONCAT(TIMESTAMPDIFF(HOUR, data_envio, NOW()), 'h atrás')
                    ELSE DATE_FORMAT(data_envio, '%d/%m às %H:%i')
                END as tempo_relativo
            FROM tbl_notificacao 
            WHERE id_usuario = ${id_usuario}
            ORDER BY data_envio DESC
            LIMIT ${limit}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR NOTIFICAÇÕES DO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT NOTIFICAÇÕES NÃO LIDAS =================================
const selectNotificacoesNaoLidas = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                *,
                CASE 
                    WHEN TIMESTAMPDIFF(MINUTE, data_envio, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, data_envio, NOW()), ' min atrás')
                    WHEN TIMESTAMPDIFF(HOUR, data_envio, NOW()) < 24 
                    THEN CONCAT(TIMESTAMPDIFF(HOUR, data_envio, NOW()), 'h atrás')
                    ELSE DATE_FORMAT(data_envio, '%d/%m às %H:%i')
                END as tempo_relativo
            FROM tbl_notificacao 
            WHERE id_usuario = ${id_usuario} AND lida = FALSE
            ORDER BY data_envio DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR NOTIFICAÇÕES NÃO LIDAS:", error);
        return false;
    }
};

// ================================ COUNT NOTIFICAÇÕES NÃO LIDAS =================================
const countNotificacoesNaoLidas = async function (id_usuario) {
    try {
        let sql = `
            SELECT COUNT(*) as total_nao_lidas
            FROM tbl_notificacao 
            WHERE id_usuario = ${id_usuario} AND lida = FALSE
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0].total_nao_lidas : 0;
    } catch (error) {
        console.log("ERRO AO CONTAR NOTIFICAÇÕES NÃO LIDAS:", error);
        return 0;
    }
};

// ================================ SELECT NOTIFICAÇÕES BY TIPO =================================
const selectNotificacoesByTipo = async function (id_usuario, tipo) {
    try {
        let sql = `
            SELECT 
                *,
                CASE 
                    WHEN TIMESTAMPDIFF(MINUTE, data_envio, NOW()) < 60 
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE, data_envio, NOW()), ' min atrás')
                    WHEN TIMESTAMPDIFF(HOUR, data_envio, NOW()) < 24 
                    THEN CONCAT(TIMESTAMPDIFF(HOUR, data_envio, NOW()), 'h atrás')
                    ELSE DATE_FORMAT(data_envio, '%d/%m às %H:%i')
                END as tempo_relativo
            FROM tbl_notificacao 
            WHERE id_usuario = ${id_usuario} AND tipo = '${tipo}'
            ORDER BY data_envio DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR NOTIFICAÇÕES POR TIPO:", error);
        return false;
    }
};

// ================================ FUNÇÕES ESPECIALIZADAS =================================

// Notificar promoção em favorito
const notificarPromocaoFavorito = async function (id_usuario, nome_produto, preco_promocional, nome_estabelecimento) {
    try {
        const mensagem = `🔥 Seu produto favorito "${nome_produto}" está em promoção por R$ ${preco_promocional} no ${nome_estabelecimento}!`;
        return await insertNotificacao({
            id_usuario,
            mensagem,
            tipo: 'promocao'
        });
    } catch (error) {
        console.log("ERRO AO NOTIFICAR PROMOÇÃO FAVORITO:", error);
        return false;
    }
};

// Notificar nova compra
const notificarNovaCompra = async function (id_usuario, id_compra, valor_total) {
    try {
        const mensagem = `✅ Compra #${id_compra} confirmada! Valor: R$ ${valor_total}. Acompanhe o status na área "Meus Pedidos".`;
        return await insertNotificacao({
            id_usuario,
            mensagem,
            tipo: 'compra'
        });
    } catch (error) {
        console.log("ERRO AO NOTIFICAR NOVA COMPRA:", error);
        return false;
    }
};

// Notificar status da compra
const notificarStatusCompra = async function (id_usuario, id_compra, status) {
    try {
        const statusMessages = {
            'confirmada': `🛍️ Pedido #${id_compra} confirmado pelo estabelecimento!`,
            'processando': `⏳ Pedido #${id_compra} está sendo preparado.`,
            'enviada': `🚚 Pedido #${id_compra} saiu para entrega!`,
            'entregue': `🎉 Pedido #${id_compra} foi entregue! Que tal avaliar sua experiência?`,
            'cancelada': `❌ Pedido #${id_compra} foi cancelado. Entre em contato conosco se tiver dúvidas.`
        };

        const mensagem = statusMessages[status] || `📋 Status do pedido #${id_compra} atualizado para: ${status}`;
        
        return await insertNotificacao({
            id_usuario,
            mensagem,
            tipo: 'compra'
        });
    } catch (error) {
        console.log("ERRO AO NOTIFICAR STATUS COMPRA:", error);
        return false;
    }
};

// Notificar carrinho abandonado
const notificarCarrinhoAbandonado = async function (id_usuario, total_itens) {
    try {
        const mensagem = `🛒 Você esqueceu ${total_itens} ${total_itens > 1 ? 'itens' : 'item'} no seu carrinho! Finalize sua compra antes que as promoções acabem.`;
        return await insertNotificacao({
            id_usuario,
            mensagem,
            tipo: 'carrinho'
        });
    } catch (error) {
        console.log("ERRO AO NOTIFICAR CARRINHO ABANDONADO:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertNotificacao,
    marcarComoLida,
    marcarTodasComoLidas,
    deleteNotificacao,
    deleteNotificacaoesAntigas,
    selectNotificacaoesUsuario,
    selectNotificacoesNaoLidas,
    countNotificacoesNaoLidas,
    selectNotificacoesByTipo,
    // Funções especializadas
    notificarPromocaoFavorito,
    notificarNovaCompra,
    notificarStatusCompra,
    notificarCarrinhoAbandonado
};