/*****************************************************************************************
 * INTEGRAÇÃO COM STRIPE BRASIL
 * Objetivo --> Service para processamento real de pagamentos via Stripe
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 *****************************************************************************************/

const stripe_key = process.env.STRIPE_SECRET_KEY;

// Verificar se Stripe está configurado
if (!stripe_key) {
    console.log('⚠️ STRIPE_SECRET_KEY não configurada. Configure no .env para usar pagamentos reais.');
    
    // Exportar funções simuladas se Stripe não estiver configurado
    module.exports = {
        processarPagamentoCartao: async () => ({ 
            success: false, 
            message: 'Stripe não configurado. Configure STRIPE_SECRET_KEY no .env' 
        }),
        gerarPIXStripe: async () => ({ 
            success: false, 
            message: 'Stripe não configurado. Configure STRIPE_SECRET_KEY no .env' 
        }),
        verificarStatusPagamento: async () => ({ 
            success: false, 
            message: 'Stripe não configurado' 
        }),
        processarReembolso: async () => ({ 
            success: false, 
            message: 'Stripe não configurado' 
        })
    };
} else {
    // Stripe configurado - usar integração real
    const stripe = require('stripe')(stripe_key);

    /**
     * PROCESSAR PAGAMENTO COM CARTÃO - STRIPE
     */
    const processarPagamentoCartao = async function (dadosPagamento) {
        try {
            const { 
                valor_total, 
                dados_cartao, 
                email_cliente,
                descricao = "Compra InfoHub"
            } = dadosPagamento;

            // Converter para centavos (Stripe trabalha em centavos)
            const valorCentavos = Math.round(parseFloat(valor_total) * 100);

            // Criar Payment Intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: valorCentavos,
                currency: 'brl',
                payment_method_types: ['card'],
                receipt_email: email_cliente,
                description: descricao,
                metadata: {
                    sistema: 'InfoHub',
                    tipo: 'compra_carrinho'
                }
            });

            // Confirmar pagamento com dados do cartão
            const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
                payment_method: {
                    type: 'card',
                    card: {
                        number: dados_cartao.numero,
                        exp_month: dados_cartao.mes_vencimento,
                        exp_year: dados_cartao.ano_vencimento,
                        cvc: dados_cartao.cvv
                    }
                }
            });

            if (confirmedPayment.status === 'succeeded') {
                return {
                    success: true,
                    transaction_id: confirmedPayment.id,
                    status: 'aprovado',
                    valor_cobrado: (confirmedPayment.amount / 100).toFixed(2),
                    taxa_processamento: ((confirmedPayment.amount * 0.034) / 100).toFixed(2), // 3.4% Stripe Brasil
                    message: 'Pagamento aprovado com sucesso.'
                };
            } else {
                return {
                    success: false,
                    status: confirmedPayment.status,
                    message: 'Pagamento não foi aprovado.',
                    error_code: confirmedPayment.last_payment_error?.code
                };
            }

        } catch (error) {
            console.log("ERRO STRIPE PAGAMENTO:", error);
            return {
                success: false,
                status: 'erro',
                message: error.message || 'Erro no processamento do pagamento.'
            };
        }
    };

    /**
     * GERAR PIX VIA STRIPE
     */
    const gerarPIXStripe = async function (dadosPIX) {
        try {
            const { valor_total, email_cliente, descricao = "Compra InfoHub" } = dadosPIX;
            const valorCentavos = Math.round(parseFloat(valor_total) * 100);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: valorCentavos,
                currency: 'brl',
                payment_method_types: ['pix'],
                receipt_email: email_cliente,
                description: descricao
            });

            return {
                success: true,
                payment_intent_id: paymentIntent.id,
                pix_code: paymentIntent.next_action?.pix_display_qr_code?.data,
                qr_code_url: paymentIntent.next_action?.pix_display_qr_code?.image_url_svg,
                expires_at: paymentIntent.next_action?.pix_display_qr_code?.expires_at,
                message: 'PIX gerado com sucesso.'
            };

        } catch (error) {
            console.log("ERRO STRIPE PIX:", error);
            return {
                success: false,
                message: error.message || 'Erro ao gerar PIX.'
            };
        }
    };

    /**
     * VERIFICAR STATUS DO PAGAMENTO
     */
    const verificarStatusPagamento = async function (payment_intent_id) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
            
            return {
                success: true,
                status: paymentIntent.status,
                valor: (paymentIntent.amount / 100).toFixed(2),
                paid: paymentIntent.status === 'succeeded',
                data_criacao: new Date(paymentIntent.created * 1000),
                metodo_pagamento: paymentIntent.payment_method_types[0]
            };

        } catch (error) {
            console.log("ERRO VERIFICAR STATUS:", error);
            return {
                success: false,
                message: error.message
            };
        }
    };

    /**
     * PROCESSAR REEMBOLSO
     */
    const processarReembolso = async function (payment_intent_id, valor_reembolso = null) {
        try {
            const refundData = {
                payment_intent: payment_intent_id
            };

            // Se valor específico for informado
            if (valor_reembolso) {
                refundData.amount = Math.round(parseFloat(valor_reembolso) * 100);
            }

            const refund = await stripe.refunds.create(refundData);

            return {
                success: true,
                refund_id: refund.id,
                valor_reembolsado: (refund.amount / 100).toFixed(2),
                status: refund.status,
                previsao_estorno: '5-10 dias úteis',
                message: 'Reembolso processado com sucesso.'
            };

        } catch (error) {
            console.log("ERRO REEMBOLSO:", error);
            return {
                success: false,
                message: error.message || 'Erro ao processar reembolso.'
            };
        }
    };

    module.exports = {
        processarPagamentoCartao,
        gerarPIXStripe,
        verificarStatusPagamento,
        processarReembolso
    };
}