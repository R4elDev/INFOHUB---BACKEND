/*****************************************************************************************
 * Objetivo --> Service responsável por notificações em tempo real e processamento
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 *****************************************************************************************/

const notificacaoDAO = require('../model/DAO/notificacao.js');
const favoritoDAO = require('../model/DAO/favorito.js');
const carrinhoDAO = require('../model/DAO/carrinho.js');

/**
 * SERVIÇO DE NOTIFICAÇÃO DE PROMOÇÃO PARA FAVORITOS
 */
const notificarPromocaoFavoritos = async function (id_produto, preco_promocional, nome_estabelecimento) {
    try {
        // Buscar todos os usuários que têm este produto nos favoritos
        const usuarios = await prisma.$queryRawUnsafe(`
            SELECT DISTINCT f.id_usuario, p.nome as nome_produto
            FROM tbl_favorito f
            INNER JOIN tbl_produto p ON f.id_produto = p.id_produto
            WHERE f.id_produto = ${id_produto}
        `);

        if (usuarios && usuarios.length > 0) {
            for (let usuario of usuarios) {
                await notificacaoDAO.notificarPromocaoFavorito(
                    usuario.id_usuario,
                    usuario.nome_produto,
                    preco_promocional,
                    nome_estabelecimento
                );
            }
        }

        return {
            success: true,
            usuarios_notificados: usuarios ? usuarios.length : 0
        };
    } catch (error) {
        console.log("ERRO NO SERVICE NOTIFICAR PROMOÇÃO FAVORITOS:", error);
        return { success: false, error: error.message };
    }
};

/**
 * SERVIÇO DE NOTIFICAÇÃO DE CARRINHO ABANDONADO
 */
const processarCarrinhoAbandonado = async function () {
    try {
        // Buscar carrinhos com itens há mais de 24 horas sem modificação
        const carrinhos = await prisma.$queryRawUnsafe(`
            SELECT 
                c.id_usuario,
                COUNT(*) as total_itens,
                MAX(c.data_adicionado) as ultima_modificacao
            FROM tbl_carrinho c
            WHERE c.data_adicionado < DATE_SUB(NOW(), INTERVAL 1 DAY)
            GROUP BY c.id_usuario
            HAVING COUNT(*) > 0
        `);

        let notificacoesEnviadas = 0;

        if (carrinhos && carrinhos.length > 0) {
            for (let carrinho of carrinhos) {
                // Verificar se não foi enviada notificação de carrinho abandonado nas últimas 24h
                const jaNotificou = await prisma.$queryRawUnsafe(`
                    SELECT id_notificacao
                    FROM tbl_notificacao
                    WHERE id_usuario = ${carrinho.id_usuario}
                    AND tipo = 'carrinho'
                    AND data_envio > DATE_SUB(NOW(), INTERVAL 1 DAY)
                    LIMIT 1
                `);

                if (!jaNotificou || jaNotificou.length === 0) {
                    await notificacaoDAO.notificarCarrinhoAbandonado(
                        carrinho.id_usuario,
                        carrinho.total_itens
                    );
                    notificacoesEnviadas++;
                }
            }
        }

        return {
            success: true,
            carrinhos_processados: carrinhos ? carrinhos.length : 0,
            notificacoes_enviadas: notificacoesEnviadas
        };
    } catch (error) {
        console.log("ERRO NO SERVICE CARRINHO ABANDONADO:", error);
        return { success: false, error: error.message };
    }
};

/**
 * SERVIÇO DE LIMPEZA DE NOTIFICAÇÕES ANTIGAS
 */
const limparNotificacoesAntigas = async function (diasAntigos = 30) {
    try {
        const resultado = await notificacaoDAO.deleteNotificacaoesAntigas(diasAntigos);
        
        return {
            success: true,
            limpo: resultado
        };
    } catch (error) {
        console.log("ERRO NO SERVICE LIMPAR NOTIFICAÇÕES:", error);
        return { success: false, error: error.message };
    }
};

/**
 * SERVIÇO DE ESTATÍSTICAS DE NOTIFICAÇÕES
 */
const obterEstatisticasNotificacoes = async function () {
    try {
        const stats = await prisma.$queryRawUnsafe(`
            SELECT 
                COUNT(*) as total_notificacoes,
                SUM(CASE WHEN lida = FALSE THEN 1 ELSE 0 END) as nao_lidas,
                COUNT(DISTINCT id_usuario) as usuarios_ativos,
                tipo,
                COUNT(*) as total_por_tipo
            FROM tbl_notificacao
            WHERE data_envio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY tipo
            ORDER BY total_por_tipo DESC
        `);

        return {
            success: true,
            data: stats || []
        };
    } catch (error) {
        console.log("ERRO NO SERVICE ESTATÍSTICAS NOTIFICAÇÕES:", error);
        return { success: false, error: error.message };
    }
};

/**
 * SERVIÇO DE NOTIFICAÇÃO EM MASSA
 */
const enviarNotificacaoEmMassa = async function (usuarios, mensagem, tipo) {
    try {
        if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
            return { success: false, error: "Lista de usuários inválida" };
        }

        let sucessos = 0;
        let erros = 0;

        for (let id_usuario of usuarios) {
            try {
                await notificacaoDAO.insertNotificacao({
                    id_usuario,
                    mensagem,
                    tipo
                });
                sucessos++;
            } catch (error) {
                console.log(`Erro ao enviar notificação para usuário ${id_usuario}:`, error);
                erros++;
            }
        }

        return {
            success: true,
            total_usuarios: usuarios.length,
            sucessos,
            erros
        };
    } catch (error) {
        console.log("ERRO NO SERVICE NOTIFICAÇÃO EM MASSA:", error);
        return { success: false, error: error.message };
    }
};

/**
 * SERVIÇO PARA AGENDAR NOTIFICAÇÕES RECORRENTES
 */
const agendarNotificacoesRecorrentes = async function () {
    try {
        // Executar carrinho abandonado
        const carrinhoResult = await processarCarrinhoAbandonado();
        
        // Limpar notificações antigas (executar semanalmente)
        const dataAtual = new Date();
        if (dataAtual.getDay() === 0) { // Domingo
            await limparNotificacoesAntigas(30);
        }

        return {
            success: true,
            carrinho_abandonado: carrinhoResult
        };
    } catch (error) {
        console.log("ERRO NO SERVICE NOTIFICAÇÕES RECORRENTES:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    notificarPromocaoFavoritos,
    processarCarrinhoAbandonado,
    limparNotificacoesAntigas,
    obterEstatisticasNotificacoes,
    enviarNotificacaoEmMassa,
    agendarNotificacoesRecorrentes
};