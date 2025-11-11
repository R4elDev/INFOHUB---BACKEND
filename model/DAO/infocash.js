/**
 * DAO para InfoCash - Sistema de Pontos
 * Gerencia todas as operações relacionadas aos pontos dos usuários
 */

const { PrismaClient } = require('@prisma/client');

// Singleton do Prisma para evitar múltiplas conexões
let prisma;

const getPrismaClient = () => {
    if (!prisma) {
        prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }
    return prisma;
};

// Função para fechar conexão quando necessário
const closePrismaConnection = async () => {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
};

const infocashDAO = {
    
    /**
     * Buscar saldo atual do usuário
     */
    selectSaldoByUsuario: async (idUsuario) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    saldo_total,
                    ultima_atualizacao
                FROM tbl_saldo_infocash 
                WHERE id_usuario = ?
            `;
            
            const rsUsuario = await prismaClient.$queryRawUnsafe(sql, idUsuario);
            
            if (rsUsuario && rsUsuario.length > 0) {
                return rsUsuario[0];
            }
            
            // Se não existe saldo, retorna 0
            return {
                saldo_total: 0,
                ultima_atualizacao: null
            };
        } catch (error) {
            console.log("ERRO AO BUSCAR SALDO INFOCASH:", error);
            return {
                saldo_total: 0,
                ultima_atualizacao: null
            };
        }
    },

    /**
     * Buscar histórico de transações do usuário
     */
    selectHistoricoByUsuario: async (idUsuario, limite = 50) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    id_transacao,
                    tipo_acao,
                    pontos,
                    descricao,
                    data_transacao,
                    referencia_id
                FROM tbl_infocash 
                WHERE id_usuario = ?
                ORDER BY data_transacao DESC
                LIMIT ?
            `;
            
            const rsHistorico = await prismaClient.$queryRawUnsafe(sql, idUsuario, limite);
            return rsHistorico || [];
        } catch (error) {
            console.log("ERRO AO BUSCAR HISTÓRICO INFOCASH:", error);
            return [];
        }
    },

    /**
     * Buscar total de pontos ganhos por tipo de ação
     */
    selectResumoByUsuario: async (idUsuario) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    tipo_acao,
                    COUNT(*) as total_transacoes,
                    SUM(pontos) as total_pontos
                FROM tbl_infocash 
                WHERE id_usuario = ?
                GROUP BY tipo_acao
            `;
            
            const rsResumo = await prismaClient.$queryRawUnsafe(sql, idUsuario);
            return rsResumo || [];
        } catch (error) {
            console.log("ERRO AO BUSCAR RESUMO INFOCASH:", error);
            return [];
        }
    },

    /**
     * Conceder pontos manualmente (para casos especiais)
     */
    insertPontosManual: async (dadosTransacao) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                INSERT INTO tbl_infocash 
                (id_usuario, tipo_acao, pontos, descricao, referencia_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const result = await prismaClient.$executeRawUnsafe(
                sql, 
                dadosTransacao.id_usuario,
                dadosTransacao.tipo_acao,
                dadosTransacao.pontos,
                dadosTransacao.descricao,
                dadosTransacao.referencia_id || null
            );

            // Atualizar saldo se inserção foi bem-sucedida
            if (result) {
                await infocashDAO.atualizarSaldo(dadosTransacao.id_usuario, dadosTransacao.pontos);
                
                // Retornar resultado simulado para compatibilidade
                return {
                    affectedRows: 1,
                    insertId: result
                };
            }

            return result;
        } catch (error) {
            console.log("ERRO AO INSERIR PONTOS INFOCASH:", error);
            return false;
        }
    },

    /**
     * Atualizar saldo do usuário
     */
    atualizarSaldo: async (idUsuario, pontos) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                INSERT INTO tbl_saldo_infocash (id_usuario, saldo_total)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE saldo_total = saldo_total + VALUES(saldo_total)
            `;
            
            return await prismaClient.$executeRawUnsafe(sql, idUsuario, pontos);
        } catch (error) {
            console.log("ERRO AO ATUALIZAR SALDO INFOCASH:", error);
            return false;
        }
    },

    /**
     * Buscar ranking de usuários com mais pontos
     */
    selectRankingUsuarios: async (limite = 10) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    s.id_usuario,
                    u.nome,
                    s.saldo_total,
                    s.ultima_atualizacao,
                    COUNT(i.id_transacao) as total_transacoes
                FROM tbl_saldo_infocash s
                INNER JOIN tbl_usuario u ON s.id_usuario = u.id_usuario
                LEFT JOIN tbl_infocash i ON s.id_usuario = i.id_usuario
                GROUP BY s.id_usuario, u.nome, s.saldo_total, s.ultima_atualizacao
                ORDER BY s.saldo_total DESC
                LIMIT ?
            `;
            
            const rsRanking = await prismaClient.$queryRawUnsafe(sql, limite);
            return rsRanking || [];
        } catch (error) {
            console.log("ERRO AO BUSCAR RANKING INFOCASH:", error);
            return [];
        }
    },

    /**
     * Buscar estatísticas gerais do sistema InfoCash
     */
    selectEstatisticasGerais: async () => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    COUNT(DISTINCT id_usuario) as total_usuarios_ativos,
                    SUM(pontos) as total_pontos_distribuidos,
                    COUNT(*) as total_transacoes,
                    AVG(pontos) as media_pontos_transacao
                FROM tbl_infocash
            `;
            
            const rsEstatisticas = await prismaClient.$queryRawUnsafe(sql);
            return rsEstatisticas && rsEstatisticas.length > 0 ? rsEstatisticas[0] : null;
        } catch (error) {
            console.log("ERRO AO BUSCAR ESTATÍSTICAS INFOCASH:", error);
            return null;
        }
    },

    /**
     * Buscar transações por período
     */
    selectTransacoesPorPeriodo: async (idUsuario, dataInicio, dataFim) => {
        try {
            const prismaClient = getPrismaClient();
            const sql = `
                SELECT 
                    id_transacao,
                    tipo_acao,
                    pontos,
                    descricao,
                    data_transacao,
                    referencia_id
                FROM tbl_infocash 
                WHERE id_usuario = ? 
                AND data_transacao BETWEEN ? AND ?
                ORDER BY data_transacao DESC
            `;
            
            const rsTransacoes = await prismaClient.$queryRawUnsafe(sql, idUsuario, dataInicio, dataFim);
            return rsTransacoes || [];
        } catch (error) {
            console.log("ERRO AO BUSCAR TRANSAÇÕES POR PERÍODO INFOCASH:", error);
            return [];
        }
    },

    // Função para fechar conexões (útil para testes)
    closeConnection: closePrismaConnection
};

module.exports = infocashDAO;