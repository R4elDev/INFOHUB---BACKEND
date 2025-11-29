/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio das AVALIAÇÕES
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const avaliacaoDAO = require('../../model/DAO/avaliacao.js');
const infocashDAO = require('../../model/DAO/infocash.js');

/**
 * CRIAR AVALIAÇÃO
 */
const criarAvaliacao = async function (dadosAvaliacao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_usuario, id_produto, id_estabelecimento, nota, comentario } = dadosAvaliacao;

        if (!id_usuario || !nota) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_usuario' e 'nota' são obrigatórios."
            };
        }

        if (!id_produto && !id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "É necessário informar 'id_produto' ou 'id_estabelecimento'."
            };
        }

        if (id_produto && id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Informe apenas 'id_produto' OU 'id_estabelecimento', não ambos."
            };
        }

        if (nota < 1 || nota > 5) {
            return {
                status: false,
                status_code: 400,
                message: "Nota deve ser entre 1 e 5."
            };
        }

        // Verificar se o usuário pode avaliar (comprou o produto/estabelecimento)
        let podeAvaliar = await avaliacaoDAO.checkPodeAvaliar(id_usuario, id_produto, id_estabelecimento);
        if (!podeAvaliar) {
            return {
                status: false,
                status_code: 403,
                message: "Você só pode avaliar produtos/estabelecimentos após uma compra entregue."
            };
        }

        let resultAvaliacao = await avaliacaoDAO.insertAvaliacao(dadosAvaliacao);

        if (resultAvaliacao) {
            // Conceder pontos InfoCash por avaliar
            try {
                const tipoAcao = id_produto ? 'avaliar_produto' : 'avaliar_estabelecimento';
                const referenciaId = resultAvaliacao.id_avaliacao || null;
                await infocashDAO.concederPontosPorAcao(id_usuario, tipoAcao, referenciaId);
            } catch (infocashError) {
                console.log("Erro ao conceder pontos InfoCash (não crítico):", infocashError.message);
            }

            return {
                status: true,
                status_code: 201,
                message: "Avaliação criada com sucesso.",
                data: resultAvaliacao
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR AVALIAÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR AVALIAÇÃO
 */
const atualizarAvaliacao = async function (dadosAvaliacao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_avaliacao, nota, comentario } = dadosAvaliacao;

        if (!id_avaliacao) {
            return {
                status: false,
                status_code: 400,
                message: "Campo 'id_avaliacao' é obrigatório."
            };
        }

        if (nota && (nota < 1 || nota > 5)) {
            return {
                status: false,
                status_code: 400,
                message: "Nota deve ser entre 1 e 5."
            };
        }

        let resultUpdate = await avaliacaoDAO.updateAvaliacao(dadosAvaliacao);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Avaliação atualizada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR AVALIAÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * DELETAR AVALIAÇÃO
 */
const deletarAvaliacao = async function (id_avaliacao) {
    try {
        if (!id_avaliacao) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_avaliacao' é obrigatório."
            };
        }

        let resultDelete = await avaliacaoDAO.deleteAvaliacao(id_avaliacao);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Avaliação deletada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR AVALIAÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR AVALIAÇÕES DE UM PRODUTO
 */
const listarAvaliacoesProduto = async function (id_produto) {
    try {
        if (!id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_produto' é obrigatório."
            };
        }

        let resultAvaliacoes = await avaliacaoDAO.selectAvaliacoesProduto(id_produto);
        let estatisticas = await avaliacaoDAO.getEstatisticasProduto(id_produto);

        if (resultAvaliacoes) {
            return {
                status: true,
                status_code: 200,
                message: "Avaliações do produto encontradas com sucesso.",
                data: {
                    avaliacoes: resultAvaliacoes,
                    estatisticas: estatisticas || {
                        total_avaliacoes: 0,
                        media_formatada: 0,
                        nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0
                    }
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma avaliação encontrada para este produto.",
                data: {
                    avaliacoes: [],
                    estatisticas: {
                        total_avaliacoes: 0,
                        media_formatada: 0,
                        nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0
                    }
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR AVALIAÇÕES PRODUTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR AVALIAÇÕES DE UM ESTABELECIMENTO
 */
const listarAvaliacoesEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let resultAvaliacoes = await avaliacaoDAO.selectAvaliacoesEstabelecimento(id_estabelecimento);
        let estatisticas = await avaliacaoDAO.getEstatisticasEstabelecimento(id_estabelecimento);

        if (resultAvaliacoes) {
            return {
                status: true,
                status_code: 200,
                message: "Avaliações do estabelecimento encontradas com sucesso.",
                data: {
                    avaliacoes: resultAvaliacoes,
                    estatisticas: estatisticas || {
                        total_avaliacoes: 0,
                        media_formatada: 0,
                        nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0
                    }
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma avaliação encontrada para este estabelecimento.",
                data: {
                    avaliacoes: [],
                    estatisticas: {
                        total_avaliacoes: 0,
                        media_formatada: 0,
                        nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0
                    }
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR AVALIAÇÕES ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR AVALIAÇÕES DO USUÁRIO
 */
const listarAvaliacoesUsuario = async function (id_usuario) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        let resultAvaliacoes = await avaliacaoDAO.selectAvaliacoesUsuario(id_usuario);

        if (resultAvaliacoes) {
            return {
                status: true,
                status_code: 200,
                message: "Avaliações do usuário encontradas com sucesso.",
                data: resultAvaliacoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Usuário ainda não fez nenhuma avaliação.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR AVALIAÇÕES USUÁRIO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * OBTER ESTATÍSTICAS DE PRODUTO
 */
const obterEstatisticasProduto = async function (id_produto) {
    try {
        if (!id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_produto' é obrigatório."
            };
        }

        let estatisticas = await avaliacaoDAO.getEstatisticasProduto(id_produto);

        if (estatisticas) {
            return {
                status: true,
                status_code: 200,
                message: "Estatísticas do produto obtidas com sucesso.",
                data: estatisticas
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Produto sem avaliações ainda.",
                data: {
                    total_avaliacoes: 0,
                    media_formatada: 0,
                    nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0,
                    perc_5: 0, perc_4: 0, perc_3: 0, perc_2: 0, perc_1: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ESTATÍSTICAS PRODUTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * OBTER ESTATÍSTICAS DE ESTABELECIMENTO
 */
const obterEstatisticasEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let estatisticas = await avaliacaoDAO.getEstatisticasEstabelecimento(id_estabelecimento);

        if (estatisticas) {
            return {
                status: true,
                status_code: 200,
                message: "Estatísticas do estabelecimento obtidas com sucesso.",
                data: estatisticas
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Estabelecimento sem avaliações ainda.",
                data: {
                    total_avaliacoes: 0,
                    media_formatada: 0,
                    nota_5: 0, nota_4: 0, nota_3: 0, nota_2: 0, nota_1: 0,
                    perc_5: 0, perc_4: 0, perc_3: 0, perc_2: 0, perc_1: 0
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ESTATÍSTICAS ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR PRODUTOS MAIS BEM AVALIADOS
 */
const listarProdutosMaisBemAvaliados = async function (limit) {
    try {
        const limite = limit || 10;

        let resultProdutos = await avaliacaoDAO.selectProdutosMaisBemAvaliados(limite);

        if (resultProdutos) {
            return {
                status: true,
                status_code: 200,
                message: "Produtos mais bem avaliados encontrados com sucesso.",
                data: resultProdutos
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhum produto com avaliações suficientes encontrado.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER PRODUTOS MAIS BEM AVALIADOS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * VERIFICAR SE USUÁRIO PODE AVALIAR
 */
const verificarPodeAvaliar = async function (id_usuario, id_produto, id_estabelecimento) {
    try {
        if (!id_usuario) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_usuario' é obrigatório."
            };
        }

        if (!id_produto && !id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "É necessário informar 'id_produto' ou 'id_estabelecimento'."
            };
        }

        let podeAvaliar = await avaliacaoDAO.checkPodeAvaliar(id_usuario, id_produto, id_estabelecimento);

        return {
            status: true,
            status_code: 200,
            message: "Verificação realizada com sucesso.",
            data: {
                pode_avaliar: podeAvaliar
            }
        };

    } catch (error) {
        console.log("ERRO NO CONTROLLER VERIFICAR PODE AVALIAR:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    criarAvaliacao,
    atualizarAvaliacao,
    deletarAvaliacao,
    listarAvaliacoesProduto,
    listarAvaliacoesEstabelecimento,
    listarAvaliacoesUsuario,
    obterEstatisticasProduto,
    obterEstatisticasEstabelecimento,
    listarProdutosMaisBemAvaliados,
    verificarPodeAvaliar
};