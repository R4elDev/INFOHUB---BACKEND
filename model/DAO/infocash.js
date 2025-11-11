/**
 * DAO para InfoCash - Sistema de Pontos
 * Gerencia todas as operações relacionadas aos pontos dos usuários
 */

const database = require('../../modulo/config.js');

const infocashDAO = {
    
    /**
     * Buscar saldo atual do usuário
     */
    selectSaldoByUsuario: async (idUsuario) => {
        const sql = `
            SELECT 
                saldo_total,
                ultima_atualizacao
            FROM tbl_saldo_infocash 
            WHERE id_usuario = ?
        `;
        
        const rsUsuario = await database.execute(sql, [idUsuario]);
        
        if (rsUsuario && rsUsuario.length > 0) {
            return rsUsuario[0];
        }
        
        // Se não existe saldo, retorna 0
        return {
            saldo_total: 0,
            ultima_atualizacao: null
        };
    },

    /**
     * Buscar histórico de transações do usuário
     */
    selectHistoricoByUsuario: async (idUsuario, limite = 50) => {
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
        
        const rsHistorico = await database.execute(sql, [idUsuario, limite]);
        return rsHistorico || [];
    },

    /**
     * Buscar total de pontos ganhos por tipo de ação
     */
    selectResumoByUsuario: async (idUsuario) => {
        const sql = `
            SELECT 
                tipo_acao,
                COUNT(*) as total_transacoes,
                SUM(pontos) as total_pontos
            FROM tbl_infocash 
            WHERE id_usuario = ?
            GROUP BY tipo_acao
        `;
        
        const rsResumo = await database.execute(sql, [idUsuario]);
        return rsResumo || [];
    },

    /**
     * Conceder pontos manualmente (para casos especiais)
     */
    insertPontosManual: async (dadosTransacao) => {
        const sql = `
            INSERT INTO tbl_infocash 
            (id_usuario, tipo_acao, pontos, descricao, referencia_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await database.execute(sql, [
            dadosTransacao.id_usuario,
            dadosTransacao.tipo_acao,
            dadosTransacao.pontos,
            dadosTransacao.descricao,
            dadosTransacao.referencia_id
        ]);

        // Atualizar saldo
        if (result && result.affectedRows > 0) {
            await infocashDAO.atualizarSaldo(dadosTransacao.id_usuario, dadosTransacao.pontos);
        }

        return result;
    },

    /**
     * Atualizar saldo do usuário
     */
    atualizarSaldo: async (idUsuario, pontos) => {
        const sql = `
            INSERT INTO tbl_saldo_infocash (id_usuario, saldo_total)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE saldo_total = saldo_total + ?
        `;
        
        return await database.execute(sql, [idUsuario, pontos, pontos]);
    },

    /**
     * Buscar ranking de usuários com mais pontos
     */
    selectRankingUsuarios: async (limite = 10) => {
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
        
        const rsRanking = await database.execute(sql, [limite]);
        return rsRanking || [];
    },

    /**
     * Buscar estatísticas gerais do sistema InfoCash
     */
    selectEstatisticasGerais: async () => {
        const sql = `
            SELECT 
                COUNT(DISTINCT id_usuario) as total_usuarios_ativos,
                SUM(pontos) as total_pontos_distribuidos,
                COUNT(*) as total_transacoes,
                AVG(pontos) as media_pontos_transacao
            FROM tbl_infocash
        `;
        
        const rsEstatisticas = await database.execute(sql);
        return rsEstatisticas && rsEstatisticas.length > 0 ? rsEstatisticas[0] : null;
    },

    /**
     * Buscar transações por período
     */
    selectTransacoesPorPeriodo: async (idUsuario, dataInicio, dataFim) => {
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
        
        const rsTransacoes = await database.execute(sql, [idUsuario, dataInicio, dataFim]);
        return rsTransacoes || [];
    }
};

module.exports = infocashDAO;