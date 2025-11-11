/**************************************************************************
 * Objetivo ==> Controller responsável pela regra de negócio das PROMOÇÕES
 * Data ==> 11/11/2025
 * Autor ==> InfoHub Team
 ****************************************************************************/

const MESSAGE = require('../../modulo/config.js');
const promocaoDAO = require('../../model/DAO/promocao.js');
const notificacaoDAO = require('../../model/DAO/notificacao.js');

/**
 * CRIAR NOVA PROMOÇÃO
 */
const criarPromocao = async function (dadosPromocao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_produto, id_estabelecimento, preco_promocional, data_inicio, data_fim, descricao_promocao } = dadosPromocao;

        if (!id_produto || !id_estabelecimento || !preco_promocional || !data_inicio || !data_fim) {
            return {
                status: false,
                status_code: 400,
                message: "Campos 'id_produto', 'id_estabelecimento', 'preco_promocional', 'data_inicio' e 'data_fim' são obrigatórios."
            };
        }

        if (preco_promocional <= 0) {
            return {
                status: false,
                status_code: 400,
                message: "Preço promocional deve ser maior que zero."
            };
        }

        // Validar datas
        const dataInicio = new Date(data_inicio);
        const dataFim = new Date(data_fim);
        const dataAtual = new Date();

        if (dataInicio < dataAtual) {
            return {
                status: false,
                status_code: 400,
                message: "Data de início não pode ser anterior à data atual."
            };
        }

        if (dataFim <= dataInicio) {
            return {
                status: false,
                status_code: 400,
                message: "Data de fim deve ser posterior à data de início."
            };
        }

        let resultPromocao = await promocaoDAO.insertPromocao(dadosPromocao);

        if (resultPromocao) {
            // Notificar usuários que favoritaram este produto
            await notificacaoDAO.notificarPromocaoFavorito(id_produto, preco_promocional);

            return {
                status: true,
                status_code: 201,
                message: "Promoção criada com sucesso.",
                data: resultPromocao
            };
        } else {
            return MESSAGE.ERROR_INTERNAL_SERVER_DB;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER CRIAR PROMOÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * ATUALIZAR PROMOÇÃO
 */
const atualizarPromocao = async function (dadosPromocao, contentType) {
    try {
        if (contentType !== 'application/json') {
            return MESSAGE.ERROR_CONTENT_TYPE;
        }

        const { id_promocao } = dadosPromocao;

        if (!id_promocao) {
            return {
                status: false,
                status_code: 400,
                message: "Campo 'id_promocao' é obrigatório."
            };
        }

        // Verificar se a promoção existe
        let promocaoExistente = await promocaoDAO.selectPromocaoById(id_promocao);
        if (!promocaoExistente) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        // Validar preço se fornecido
        if (dadosPromocao.preco_promocional && dadosPromocao.preco_promocional <= 0) {
            return {
                status: false,
                status_code: 400,
                message: "Preço promocional deve ser maior que zero."
            };
        }

        // Validar datas se fornecidas
        if (dadosPromocao.data_inicio && dadosPromocao.data_fim) {
            const dataInicio = new Date(dadosPromocao.data_inicio);
            const dataFim = new Date(dadosPromocao.data_fim);

            if (dataFim <= dataInicio) {
                return {
                    status: false,
                    status_code: 400,
                    message: "Data de fim deve ser posterior à data de início."
                };
            }
        }

        let resultUpdate = await promocaoDAO.updatePromocao(dadosPromocao);

        if (resultUpdate) {
            return {
                status: true,
                status_code: 200,
                message: "Promoção atualizada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER ATUALIZAR PROMOÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * DELETAR PROMOÇÃO
 */
const deletarPromocao = async function (id_promocao) {
    try {
        if (!id_promocao) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_promocao' é obrigatório."
            };
        }

        // Verificar se a promoção existe
        let promocaoExistente = await promocaoDAO.selectPromocaoById(id_promocao);
        if (!promocaoExistente) {
            return MESSAGE.ERROR_NOT_FOUND;
        }

        let resultDelete = await promocaoDAO.deletePromocao(id_promocao);

        if (resultDelete) {
            return {
                status: true,
                status_code: 200,
                message: "Promoção deletada com sucesso."
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER DELETAR PROMOÇÃO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * BUSCAR PROMOÇÃO POR ID
 */
const buscarPromocaoPorId = async function (id_promocao) {
    try {
        if (!id_promocao) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_promocao' é obrigatório."
            };
        }

        let resultPromocao = await promocaoDAO.selectPromocaoById(id_promocao);

        if (resultPromocao) {
            return {
                status: true,
                status_code: 200,
                message: "Promoção encontrada com sucesso.",
                data: resultPromocao
            };
        } else {
            return MESSAGE.ERROR_NOT_FOUND;
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER BUSCAR PROMOÇÃO POR ID:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR PROMOÇÕES ATIVAS
 */
const listarPromocoesAtivas = async function () {
    try {
        let resultPromocoes = await promocaoDAO.selectPromocoesAtivas();

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Promoções ativas encontradas com sucesso.",
                data: resultPromocoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma promoção ativa encontrada.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR PROMOÇÕES ATIVAS:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR PROMOÇÕES DE PRODUTO
 */
const listarPromocoesProduto = async function (id_produto) {
    try {
        if (!id_produto) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_produto' é obrigatório."
            };
        }

        let resultPromocoes = await promocaoDAO.selectPromocoesProduto(id_produto);

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Promoções do produto encontradas com sucesso.",
                data: resultPromocoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma promoção encontrada para este produto.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR PROMOÇÕES PRODUTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR PROMOÇÕES DE ESTABELECIMENTO
 */
const listarPromocoesEstabelecimento = async function (id_estabelecimento) {
    try {
        if (!id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetro 'id_estabelecimento' é obrigatório."
            };
        }

        let resultPromocoes = await promocaoDAO.selectPromocoesEstabelecimento(id_estabelecimento);

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Promoções do estabelecimento encontradas com sucesso.",
                data: resultPromocoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma promoção encontrada para este estabelecimento.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR PROMOÇÕES ESTABELECIMENTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR MELHORES PROMOÇÕES
 */
const listarMelhoresPromocoes = async function (limit = 10) {
    try {
        let resultPromocoes = await promocaoDAO.selectMelhoresPromocoes(limit);

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Melhores promoções encontradas com sucesso.",
                data: resultPromocoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma promoção encontrada.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR MELHORES PROMOÇÕES:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * LISTAR TODAS AS PROMOÇÕES (ADMIN)
 */
const listarTodasPromocoes = async function () {
    try {
        let resultPromocoes = await promocaoDAO.selectAllPromocoes();

        if (resultPromocoes) {
            return {
                status: true,
                status_code: 200,
                message: "Promoções encontradas com sucesso.",
                data: resultPromocoes
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Nenhuma promoção encontrada.",
                data: []
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER LISTAR TODAS PROMOÇÕES:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

/**
 * VERIFICAR PROMOÇÃO DE PRODUTO
 */
const verificarPromocaoProduto = async function (id_produto, id_estabelecimento) {
    try {
        if (!id_produto || !id_estabelecimento) {
            return {
                status: false,
                status_code: 400,
                message: "Parâmetros 'id_produto' e 'id_estabelecimento' são obrigatórios."
            };
        }

        let resultPromocao = await promocaoDAO.verificarPromocaoProduto(id_produto, id_estabelecimento);

        if (resultPromocao) {
            return {
                status: true,
                status_code: 200,
                message: "Produto em promoção.",
                data: {
                    em_promocao: true,
                    promocao: resultPromocao
                }
            };
        } else {
            return {
                status: true,
                status_code: 200,
                message: "Produto não está em promoção.",
                data: {
                    em_promocao: false,
                    promocao: null
                }
            };
        }

    } catch (error) {
        console.log("ERRO NO CONTROLLER VERIFICAR PROMOÇÃO PRODUTO:", error);
        return MESSAGE.ERROR_INTERNAL_SERVER;
    }
};

module.exports = {
    criarPromocao,
    atualizarPromocao,
    deletarPromocao,
    buscarPromocaoPorId,
    listarPromocoesAtivas,
    listarPromocoesProduto,
    listarPromocoesEstabelecimento,
    listarMelhoresPromocoes,
    listarTodasPromocoes,
    verificarPromocaoProduto
};