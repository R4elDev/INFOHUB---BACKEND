/**
 * Controller para InfoCash - Sistema de Pontos
 * Gerencia todas as requisições relacionadas aos pontos dos usuários
 */

const infocashDAO = require('../../model/DAO/infocash.js');

const infocashController = {

    /**
     * Buscar saldo atual do usuário
     * GET /infocash/saldo/:id
     */
    getSaldo: async (req, res) => {
        try {
            const idUsuario = req.params.id;

            if (!idUsuario) {
                return res.status(400).json({
                    status: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            const saldo = await infocashDAO.selectSaldoByUsuario(idUsuario);

            return res.status(200).json({
                status: true,
                message: 'Saldo InfoCash consultado com sucesso',
                data: saldo
            });

        } catch (error) {
            console.error('Erro ao consultar saldo InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar histórico de transações do usuário
     * GET /infocash/historico/:id?limite=50
     */
    getHistorico: async (req, res) => {
        try {
            const idUsuario = req.params.id;
            const limite = req.query.limite || 50;

            if (!idUsuario) {
                return res.status(400).json({
                    status: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            const historico = await infocashDAO.selectHistoricoByUsuario(idUsuario, limite);

            return res.status(200).json({
                status: true,
                message: 'Histórico InfoCash consultado com sucesso',
                data: historico
            });

        } catch (error) {
            console.error('Erro ao consultar histórico InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar resumo de pontos por tipo de ação
     * GET /infocash/resumo/:id
     */
    getResumo: async (req, res) => {
        try {
            const idUsuario = req.params.id;

            if (!idUsuario) {
                return res.status(400).json({
                    status: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            const resumo = await infocashDAO.selectResumoByUsuario(idUsuario);

            return res.status(200).json({
                status: true,
                message: 'Resumo InfoCash consultado com sucesso',
                data: resumo
            });

        } catch (error) {
            console.error('Erro ao consultar resumo InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Conceder pontos manualmente (para administradores)
     * POST /infocash/conceder
     */
    concederPontos: async (req, res) => {
        try {
            const { id_usuario, tipo_acao, pontos, descricao, referencia_id } = req.body;

            // Validações
            if (!id_usuario || !tipo_acao || !pontos || !descricao) {
                return res.status(400).json({
                    status: false,
                    message: 'Campos obrigatórios: id_usuario, tipo_acao, pontos, descricao'
                });
            }

            if (pontos <= 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Pontos deve ser maior que zero'
                });
            }

            const dadosTransacao = {
                id_usuario,
                tipo_acao,
                pontos,
                descricao,
                referencia_id: referencia_id || null
            };

            const result = await infocashDAO.insertPontosManual(dadosTransacao);

            if (result && result.affectedRows > 0) {
                return res.status(201).json({
                    status: true,
                    message: 'Pontos concedidos com sucesso',
                    data: { id_transacao: result.insertId }
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Erro ao conceder pontos'
                });
            }

        } catch (error) {
            console.error('Erro ao conceder pontos InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar ranking de usuários com mais pontos
     * GET /infocash/ranking?limite=10
     */
    getRanking: async (req, res) => {
        try {
            const limite = req.query.limite || 10;

            const ranking = await infocashDAO.selectRankingUsuarios(limite);

            return res.status(200).json({
                status: true,
                message: 'Ranking InfoCash consultado com sucesso',
                data: ranking
            });

        } catch (error) {
            console.error('Erro ao consultar ranking InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar estatísticas gerais do sistema
     * GET /infocash/estatisticas
     */
    getEstatisticas: async (req, res) => {
        try {
            const estatisticas = await infocashDAO.selectEstatisticasGerais();

            return res.status(200).json({
                status: true,
                message: 'Estatísticas InfoCash consultadas com sucesso',
                data: estatisticas
            });

        } catch (error) {
            console.error('Erro ao consultar estatísticas InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar informações completas do usuário (saldo + resumo)
     * GET /infocash/perfil/:id
     */
    getPerfilCompleto: async (req, res) => {
        try {
            const idUsuario = req.params.id;

            if (!idUsuario) {
                return res.status(400).json({
                    status: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            // Buscar saldo e resumo em paralelo
            const [saldo, resumo] = await Promise.all([
                infocashDAO.selectSaldoByUsuario(idUsuario),
                infocashDAO.selectResumoByUsuario(idUsuario)
            ]);

            return res.status(200).json({
                status: true,
                message: 'Perfil InfoCash consultado com sucesso',
                data: {
                    saldo,
                    resumo
                }
            });

        } catch (error) {
            console.error('Erro ao consultar perfil InfoCash:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    },

    /**
     * Buscar transações por período
     * GET /infocash/periodo/:id?dataInicio=2023-01-01&dataFim=2023-12-31
     */
    getTransacoesPorPeriodo: async (req, res) => {
        try {
            const idUsuario = req.params.id;
            const { dataInicio, dataFim } = req.query;

            if (!idUsuario) {
                return res.status(400).json({
                    status: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    status: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const transacoes = await infocashDAO.selectTransacoesPorPeriodo(idUsuario, dataInicio, dataFim);

            return res.status(200).json({
                status: true,
                message: 'Transações por período consultadas com sucesso',
                data: transacoes
            });

        } catch (error) {
            console.error('Erro ao consultar transações por período:', error);
            return res.status(500).json({
                status: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
};

module.exports = infocashController;