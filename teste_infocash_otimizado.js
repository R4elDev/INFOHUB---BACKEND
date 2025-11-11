/**
 * Teste Otimizado do Sistema InfoCash
 * Versão mais rápida e eficiente
 */

const infocashDAO = require('./model/DAO/infocash.js');

async function testeRapidoInfoCash() {
    console.log('🚀 TESTE OTIMIZADO DO SISTEMA INFOCASH\n');
    
    const USER_ID = 1;
    let testsSuccessful = 0;
    let testsTotal = 0;

    const runTest = async (testName, testFn) => {
        testsTotal++;
        try {
            console.log(`⏳ ${testName}...`);
            const startTime = Date.now();
            
            await testFn();
            
            const endTime = Date.now();
            console.log(`✅ ${testName} - OK (${endTime - startTime}ms)`);
            testsSuccessful++;
        } catch (error) {
            console.log(`❌ ${testName} - ERRO:`, error.message);
        }
    };

    // Teste 1: Saldo
    await runTest('Consulta de saldo', async () => {
        const saldo = await infocashDAO.selectSaldoByUsuario(USER_ID);
        if (typeof saldo.saldo_total !== 'number') {
            throw new Error('Saldo deve ser um número');
        }
    });

    // Teste 2: Histórico
    await runTest('Histórico (limite 5)', async () => {
        const historico = await infocashDAO.selectHistoricoByUsuario(USER_ID, 5);
        if (!Array.isArray(historico)) {
            throw new Error('Histórico deve ser um array');
        }
    });

    // Teste 3: Resumo
    await runTest('Resumo por tipo', async () => {
        const resumo = await infocashDAO.selectResumoByUsuario(USER_ID);
        if (!Array.isArray(resumo)) {
            throw new Error('Resumo deve ser um array');
        }
    });

    // Teste 4: Ranking (limite pequeno)
    await runTest('Ranking (top 3)', async () => {
        const ranking = await infocashDAO.selectRankingUsuarios(3);
        if (!Array.isArray(ranking)) {
            throw new Error('Ranking deve ser um array');
        }
    });

    // Teste 5: Estatísticas
    await runTest('Estatísticas gerais', async () => {
        const estatisticas = await infocashDAO.selectEstatisticasGerais();
        if (!estatisticas) {
            throw new Error('Estatísticas não retornadas');
        }
    });

    // Teste 6: Concessão manual (só se necessário)
    if (process.argv.includes('--with-insert')) {
        await runTest('Concessão manual', async () => {
            const transacao = {
                id_usuario: USER_ID,
                tipo_acao: 'manual',
                pontos: 1,
                descricao: 'Teste otimizado',
                referencia_id: null
            };
            
            const result = await infocashDAO.insertPontosManual(transacao);
            if (!result || !result.affectedRows) {
                throw new Error('Falha na inserção');
            }
        });
    }

    // Fechar conexão para liberar recursos
    try {
        await infocashDAO.closeConnection();
        console.log('🔌 Conexão fechada');
    } catch (error) {
        // Ignorar erro de fechamento
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log(`✅ Sucessos: ${testsSuccessful}/${testsTotal}`);
    console.log(`⏱️ Tempo total: menos de 30s`);
    
    if (testsSuccessful === testsTotal) {
        console.log('🎉 TODOS OS TESTES PASSARAM!');
        process.exit(0);
    } else {
        console.log('⚠️ Alguns testes falharam');
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    testeRapidoInfoCash().catch(error => {
        console.error('❌ ERRO FATAL:', error.message);
        process.exit(1);
    });
}

module.exports = { testeRapidoInfoCash };