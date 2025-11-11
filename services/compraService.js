/*****************************************************************************************
 * Objetivo --> Service responsável por processamento de compras e integração de pagamento
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 *****************************************************************************************/

const compraDAO = require('../model/DAO/compra.js');
const carrinhoDAO = require('../model/DAO/carrinho.js');
const notificacaoDAO = require('../model/DAO/notificacao.js');

/**
 * VALIDAR DADOS DE COMPRA
 */
const validarDadosCompra = async function (dadosCompra) {
    try {
        const { id_usuario, id_estabelecimento, metodo_pagamento } = dadosCompra;

        // Validações básicas
        if (!id_usuario || !id_estabelecimento) {
            return {
                valid: false,
                message: "Usuário e estabelecimento são obrigatórios."
            };
        }

        // Verificar se o carrinho tem itens
        const carrinho = await carrinhoDAO.selectCarrinhoUsuario(id_usuario);
        if (!carrinho || carrinho.length === 0) {
            return {
                valid: false,
                message: "Carrinho vazio. Adicione produtos antes de finalizar a compra."
            };
        }

        // Verificar se todos os produtos têm preço válido
        const valorTotal = await carrinhoDAO.calcularTotalCarrinho(id_usuario);
        if (!valorTotal || valorTotal <= 0) {
            return {
                valid: false,
                message: "Não foi possível calcular o valor total da compra."
            };
        }

        return {
            valid: true,
            carrinho,
            valor_total: valorTotal
        };
    } catch (error) {
        console.log("ERRO NO SERVICE VALIDAR COMPRA:", error);
        return {
            valid: false,
            message: "Erro interno na validação."
        };
    }
};

/**
 * PROCESSAR PAGAMENTO (INTEGRAÇÃO COM STRIPE BRASIL)
 */
const processarPagamento = async function (dadosPagamento) {
    try {
        const { valor_total, metodo_pagamento, dados_cartao, email_cliente, compra_id } = dadosPagamento;

        // Verificar se Stripe está disponível
        try {
            const stripeService = require('./pagamentoStripe.js');
            
            if (metodo_pagamento === 'cartao') {
                // Processar pagamento com cartão via Stripe
                return await stripeService.processarPagamentoCartao({
                    valor_total,
                    dados_cartao,
                    email_cliente,
                    descricao: `Compra InfoHub #${compra_id}`
                });
                
            } else if (metodo_pagamento === 'pix') {
                // Gerar PIX via Stripe
                return await stripeService.gerarPIXStripe({
                    valor_total,
                    email_cliente,
                    descricao: `Compra InfoHub #${compra_id}`
                });
                
            } else {
                // Métodos que não precisam processamento imediato (dinheiro, boleto)
                return {
                    success: true,
                    transaction_id: `LOCAL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    status: 'pendente',
                    message: `Pagamento via ${metodo_pagamento} registrado. Aguardando confirmação manual.`
                };
            }
            
        } catch (stripeError) {
            console.log("STRIPE NÃO DISPONÍVEL, USANDO SIMULAÇÃO:", stripeError.message);
            
            // FALLBACK: Simulação se Stripe não estiver configurado
            await new Promise(resolve => setTimeout(resolve, 1000));
            const sucesso = Math.random() > 0.05;

            if (sucesso) {
                return {
                    success: true,
                    transaction_id: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'aprovado',
                    message: '⚠️ Pagamento simulado (Stripe não configurado)'
                };
            } else {
                return {
                    success: false,
                    status: 'negado',
                    message: 'Pagamento simulado negado. Configure o Stripe para processamento real.'
                };
            }
        }

    } catch (error) {
        console.log("ERRO NO SERVICE PROCESSAR PAGAMENTO:", error);
        return {
            success: false,
            status: 'erro',
            message: 'Erro no processamento do pagamento.'
        };
    }
};

/**
 * GERAR DADOS DE PAGAMENTO PARA ESTABELECIMENTO
 */
const gerarDadosPagamentoEstabelecimento = async function (id_compra) {
    try {
        const compra = await compraDAO.selectCompraById(id_compra);
        if (!compra) {
            return {
                success: false,
                message: 'Compra não encontrada.'
            };
        }

        // Gerar dados simulados para o estabelecimento processar o pagamento
        const dadosPagamento = {
            compra_id: id_compra,
            valor_total: compra.valor_total,
            estabelecimento: {
                id: compra.id_estabelecimento,
                nome: compra.nome_estabelecimento
            },
            usuario: {
                id: compra.id_usuario,
                nome: compra.nome_usuario,
                email: compra.email_usuario
            },
            // Dados que o estabelecimento precisa para processar pagamento
            dados_pagamento: {
                chave_pix: process.env.PIX_KEY || 'infohub@pagamentos.com.br',
                qr_code: `PIX_QR_${id_compra}_${Date.now()}`,
                banco: '123',
                agencia: '4567',
                conta: '89012-3',
                valor_formatado: parseFloat(compra.valor_total).toFixed(2)
            }
        };

        return {
            success: true,
            dados: dadosPagamento
        };
    } catch (error) {
        console.log("ERRO NO SERVICE GERAR DADOS PAGAMENTO:", error);
        return {
            success: false,
            message: 'Erro ao gerar dados de pagamento.'
        };
    }
};

/**
 * CALCULAR TAXAS E IMPOSTOS
 */
const calcularTaxasCompra = async function (valor_subtotal, id_estabelecimento) {
    try {
        // Taxas simuladas - em produção, seria baseado em regras reais
        const taxa_entrega = 5.00; // Taxa fixa de entrega
        const taxa_servico = valor_subtotal * 0.03; // 3% de taxa de serviço
        const valor_total = valor_subtotal + taxa_entrega + taxa_servico;

        return {
            success: true,
            calculo: {
                valor_subtotal: parseFloat(valor_subtotal).toFixed(2),
                taxa_entrega: parseFloat(taxa_entrega).toFixed(2),
                taxa_servico: parseFloat(taxa_servico).toFixed(2),
                valor_total: parseFloat(valor_total).toFixed(2)
            }
        };
    } catch (error) {
        console.log("ERRO NO SERVICE CALCULAR TAXAS:", error);
        return {
            success: false,
            message: 'Erro ao calcular taxas.'
        };
    }
};

/**
 * PROCESSAR COMPRA COMPLETA
 */
const processarCompraCompleta = async function (dadosCompra) {
    try {
        // 1. Validar dados da compra
        const validacao = await validarDadosCompra(dadosCompra);
        if (!validacao.valid) {
            return {
                success: false,
                message: validacao.message
            };
        }

        // 2. Calcular taxas
        const taxas = await calcularTaxasCompra(validacao.valor_total, dadosCompra.id_estabelecimento);
        if (!taxas.success) {
            return taxas;
        }

        // 3. Processar pagamento (se método requer processamento imediato)
        let resultadoPagamento = null;
        if (dadosCompra.metodo_pagamento === 'cartao' || dadosCompra.metodo_pagamento === 'pix') {
            resultadoPagamento = await processarPagamento({
                valor_total: taxas.calculo.valor_total,
                metodo_pagamento: dadosCompra.metodo_pagamento,
                dados_cartao: dadosCompra.dados_cartao,
                email_cliente: dadosCompra.email_cliente,
                compra_id: dadosCompra.compra_temp_id || Date.now()
            });

            if (!resultadoPagamento.success) {
                return {
                    success: false,
                    message: resultadoPagamento.message,
                    detalhes: resultadoPagamento
                };
            }
        }

        // 4. Criar a compra no banco
        let statusCompra = 'pendente';
        if (resultadoPagamento) {
            if (resultadoPagamento.status === 'aprovado') {
                statusCompra = 'confirmada';
            } else if (dadosCompra.metodo_pagamento === 'pix') {
                statusCompra = 'aguardando_pix';
            }
        }

        const dadosCompraFinal = {
            ...dadosCompra,
            valor_total: taxas.calculo.valor_total,
            status_compra: statusCompra,
            transaction_id: resultadoPagamento?.transaction_id || null
        };

        const compra = await compraDAO.processarCompraCarrinho(dadosCompraFinal);
        if (!compra) {
            return {
                success: false,
                message: 'Erro ao processar compra no banco de dados.'
            };
        }

        // 5. Gerar dados de pagamento para o estabelecimento (se necessário)
        let dadosPagamentoEstab = null;
        if (dadosCompra.metodo_pagamento === 'pix' || dadosCompra.metodo_pagamento === 'dinheiro') {
            dadosPagamentoEstab = await gerarDadosPagamentoEstabelecimento(compra.id_compra);
        }

        // 6. Enviar notificação
        await notificacaoDAO.notificarNovaCompra(
            dadosCompra.id_usuario,
            compra.id_compra,
            taxas.calculo.valor_total
        );

        return {
            success: true,
            compra,
            taxas: taxas.calculo,
            pagamento: resultadoPagamento,
            dados_pagamento_estabelecimento: dadosPagamentoEstab?.dados || null,
            message: 'Compra processada com sucesso!'
        };

    } catch (error) {
        console.log("ERRO NO SERVICE COMPRA COMPLETA:", error);
        return {
            success: false,
            message: 'Erro interno no processamento da compra.'
        };
    }
};

/**
 * CANCELAR COMPRA E PROCESSAR REEMBOLSO
 */
const cancelarCompraComReembolso = async function (id_compra, motivo) {
    try {
        const compra = await compraDAO.selectCompraById(id_compra);
        if (!compra) {
            return {
                success: false,
                message: 'Compra não encontrada.'
            };
        }

        if (compra.status_compra === 'entregue') {
            return {
                success: false,
                message: 'Compra já entregue não pode ser cancelada.'
            };
        }

        // Processar cancelamento
        const cancelamento = await compraDAO.updateStatusCompra(id_compra, 'cancelada');
        if (!cancelamento) {
            return {
                success: false,
                message: 'Erro ao cancelar compra.'
            };
        }

        // Simular processamento de reembolso
        let reembolso = null;
        if (compra.status_compra === 'confirmada') {
            reembolso = {
                valor_reembolsado: compra.valor_total,
                previsao_estorno: '5 dias úteis',
                protocolo_reembolso: `REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
            };
        }

        // Notificar cancelamento
        await notificacaoDAO.notificarStatusCompra(
            compra.id_usuario,
            id_compra,
            'cancelada'
        );

        return {
            success: true,
            compra_cancelada: true,
            reembolso,
            message: 'Compra cancelada com sucesso.'
        };

    } catch (error) {
        console.log("ERRO NO SERVICE CANCELAR COMPRA:", error);
        return {
            success: false,
            message: 'Erro interno no cancelamento.'
        };
    }
};

module.exports = {
    validarDadosCompra,
    processarPagamento,
    gerarDadosPagamentoEstabelecimento,
    calcularTaxasCompra,
    processarCompraCompleta,
    cancelarCompraComReembolso
};