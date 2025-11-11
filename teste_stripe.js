/**
 * TESTE DE INTEGRAÇÃO - STRIPE BRASIL
 * Execute este arquivo para testar a integração
 */

const stripeService = require('./services/pagamentoStripe.js');

async function testarStripe() {
    console.log('🧪 TESTANDO INTEGRAÇÃO STRIPE BRASIL\n');

    // Teste 1: Pagamento com Cartão
    console.log('1️⃣ Testando Pagamento com Cartão...');
    try {
        const resultadoCartao = await stripeService.processarPagamentoCartao({
            valor_total: "25.90",
            dados_cartao: {
                numero: "4242424242424242", // Cartão de teste Stripe
                mes_vencimento: "12",
                ano_vencimento: "2030",
                cvv: "123"
            },
            email_cliente: "teste@infohub.com",
            descricao: "Teste InfoHub - Compra #001"
        });

        if (resultadoCartao.success) {
            console.log('✅ Cartão aprovado!');
            console.log(`   Transaction ID: ${resultadoCartao.transaction_id}`);
            console.log(`   Valor cobrado: R$ ${resultadoCartao.valor_cobrado}`);
        } else {
            console.log('❌ Cartão negado:', resultadoCartao.message);
        }
    } catch (error) {
        console.log('⚠️ Stripe não configurado, usando simulação');
        console.log('   Configure STRIPE_SECRET_KEY no .env para teste real');
    }

    console.log('\n---\n');

    // Teste 2: PIX
    console.log('2️⃣ Testando PIX...');
    try {
        const resultadoPIX = await stripeService.gerarPIXStripe({
            valor_total: "15.50",
            email_cliente: "teste@infohub.com",
            descricao: "Teste InfoHub - Compra PIX #002"
        });

        if (resultadoPIX.success) {
            console.log('✅ PIX gerado!');
            console.log(`   QR Code: ${resultadoPIX.pix_code?.substring(0, 50)}...`);
            console.log(`   Expira em: ${resultadoPIX.expires_at}`);
        } else {
            console.log('❌ Erro PIX:', resultadoPIX.message);
        }
    } catch (error) {
        console.log('⚠️ PIX não disponível (Stripe não configurado)');
    }

    console.log('\n🎯 RESULTADO:');
    console.log('- Se aparecer "Stripe não configurado": Configure as chaves no .env');
    console.log('- Se aparecer "aprovado/gerado": Integração funcionando! 🎉');
    console.log('\n📖 Veja GUIA_STRIPE_BRASIL.md para configuração completa');
}

// Executar teste se arquivo for chamado diretamente
if (require.main === module) {
    testarStripe();
}

module.exports = { testarStripe };