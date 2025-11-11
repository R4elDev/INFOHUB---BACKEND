/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio das NOTIFICAÇÕES
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const notificacaoDAO = require('../../model/DAO/notificacao.js');

/**
 * CRIAR NOTIFICAÇÃO
 */
const criarNotificacao = async function (dadosNotificacao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, mensagem, tipo } = dadosNotificacao;

        if (!id_usuario || !mensagem || !tipo) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario', 'mensagem' e 'tipo' são obrigatórios."
            };
        }

        const tiposValidos = ['promocao', 'alerta', 'social', 'compra', 'carrinho'];
        if (!tiposValidos.includes(tipo)) {
            return {
                status: false,
                status_code: 400,
                message: "Tipo inválido. Use: " + tiposValidos.join(', ')
            };
        }

        let resultNotificacao = await notificacaoDAO.insertNotificacao(dadosNotificacao);

        if (resultNotificacao) {
            return {
                status: true,
                status_code: 201,
                message: "Notificação criada com sucesso.",
                data: resultNotificacao
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR NOTIFICAÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR NOTIFICAÇÕES DO USUÁRIO
 */
const listarNotificacoesUsuario = async function (id_usuario, limit) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        const limite = limit || 20;
        let resultNotificacoes = await notificacaoDAO.selectNotificacaoesUsuario(id_usuario, limite);
        let totalNaoLidas = await notificacaoDAO.countNotificacoesNaoLidas(id_usuario);

        if (resultNotificacoes) {
            return {
                status: true,
                status_code: 200,
                message: "Notificações encontradas com sucesso.",
                data: {
                    notificacoes: resultNotificacoes,
                    total_nao_lidas: totalNaoLidas,
                    total_exibidas: resultNotificacoes.length
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma notificação encontrada.",
                data: {
                    notificacoes: [],
                    total_nao_lidas: 0,
                    total_exibidas: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR NOTIFICAÇÕES:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR NOTIFICAÇÕES NÃO LIDAS
 */
const listarNotificacoesNaoLidas = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultNotificacoes = await notificacaoDAO.selectNotificacoesNaoLidas(id_usuario);
        let totalNaoLidas = await notificacaoDAO.countNotificacoesNaoLidas(id_usuario);

        if (resultNotificacoes) {
            return {
                status: true,
                status_code: 200,
                message: "Notificações não lidas encontradas com sucesso.",
                data: {
                    notificacoes: resultNotificacoes,
                    total_nao_lidas: totalNaoLidas
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Todas as notificações foram lidas.",
                data: {
                    notificacoes: [],
                    total_nao_lidas: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER NOTIFICAÇÕES NÃO LIDAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * MARCAR NOTIFICAÇÃO COMO LIDA
 */
const marcarComoLida = async function (id_notificacao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!id_notificacao) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_notificacao' é obrigatório."
            };
        }

        let resultUpdate = await notificacaoDAO.marcarComoLida(id_notificacao);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Notificação marcada como lida com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER MARCAR COMO LIDA:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * MARCAR TODAS AS NOTIFICAÇÕES COMO LIDAS
 */
const marcarTodasComoLidas = async function (id_usuario, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultUpdate = await notificacaoDAO.marcarTodasComoLidas(id_usuario);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Todas as notificações foram marcadas como lidas."
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Não há notificações não lidas."
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER MARCAR TODAS COMO LIDAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * DELETAR NOTIFICAÇÃO
 */
const deletarNotificacao = async function (id_notificacao) {
    try {
        if (!id_notificacao) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_notificacao' é obrigatório."
            };
        }

        let resultDelete = await notificacaoDAO.deleteNotificacao(id_notificacao);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Notificação deletada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR NOTIFICAÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR NOTIFICAÇÕES POR TIPO
 */
const listarNotificacoesPorTipo = async function (id_usuario, tipo) {
    try {
        if (!id_usuario || !tipo) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_usuario' e 'tipo' são obrigatórios."
            };
        }

        const tiposValidos = ['promocao', 'alerta', 'social', 'compra', 'carrinho'];
        if (!tiposValidos.includes(tipo)) {
            return {
                status: false,
                status_code: 400,
                message: "Tipo inválido. Use: " + tiposValidos.join(', ')
            };
        }

        let resultNotificacoes = await notificacaoDAO.selectNotificacoesByTipo(id_usuario, tipo);

        if (resultNotificacoes) {
            return {
                status: true,
                status_code: 200,
                message: `Notificações do tipo '${tipo}' encontradas com sucesso.`,
                data: resultNotificacoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: `Nenhuma notificação do tipo '${tipo}' encontrada.`,
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER NOTIFICAÇÕES POR TIPO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * CONTAR NOTIFICAÇÕES NÃO LIDAS
 */
const contarNotificacoesNaoLidas = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let totalNaoLidas = await notificacaoDAO.countNotificacoesNaoLidas(id_usuario);

        return {
            status: true,
            status_code: 200,
            message: "Contagem realizada com sucesso.",
            data: {
                total_nao_lidas: totalNaoLidas
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER CONTAR NÃO LIDAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LIMPAR NOTIFICAÇÕES ANTIGAS
 */
const limparNotificacoesAntigas = async function (dias, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const diasAntigos = dias || 30; // padrão 30 dias

        let resultDelete = await notificacaoDAO.deleteNotificacaoesAntigas(diasAntigos);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: `Notificações com mais de ${diasAntigos} dias foram removidas.`
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Não há notificações antigas para remover."
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LIMPAR ANTIGAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    criarNotificacao,
    listarNotificacoesUsuario,
    listarNotificacoesNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    deletarNotificacao,
    listarNotificacoesPorTipo,
    contarNotificacoesNaoLidas,
    limparNotificacoesAntigas
};