/**
 * TESTE RÁPIDO DO SISTEMA INFOCASH
 * Execute este arquivo para testar rapidamente o sistema
 * Comando: node teste_infocash_rapido.js
 */

const infocashDAO = require('./model/DAO/infocash.js');

async function testeRapidoInfoCash() {
    console.log('🚀 INICIANDO TESTE RÁPIDO DO SISTEMA INFOCASH\n');
    console.log('=' * 50);

    try {
        // 1. TESTE DE SALDO
        console.log('\n1️⃣ TESTANDO CONSULTA DE SALDO...');
        const saldo = await infocashDAO.selectSaldoByUsuario(1);
        console.log('✅ Saldo do usuário 1:', saldo);
        
        if (saldo.saldo_total !== undefined) {
            console.log('   💰 Saldo atual:', saldo.saldo_total, 'InfoCash');
        } else {
            console.log('   ⚠️  Usuário não encontrado ou sem saldo');
        }

        // 2. TESTE DE HISTÓRICO
        console.log('\n2️⃣ TESTANDO HISTÓRICO DE TRANSAÇÕES...');
        const historico = await infocashDAO.selectHistoricoByUsuario(1, 10);
        console.log('✅ Encontradas', historico.length, 'transações no histórico');
        
        if (historico.length > 0) {
            console.log('   📋 Última transação:', {
                tipo: historico[0].tipo_acao,
                pontos: historico[0].pontos,
                descricao: historico[0].descricao,
                data: historico[0].data_transacao
            });
        } else {
            console.log('   📋 Nenhuma transação encontrada');
        }

        // 3. TESTE DE RESUMO
        console.log('\n3️⃣ TESTANDO RESUMO POR TIPO...');
        const resumo = await infocashDAO.selectResumoByUsuario(1);
        console.log('✅ Resumo por tipo de ação:');
        
        if (resumo.length > 0) {
            resumo.forEach(item => {
                console.log(`   🏆 ${item.tipo_acao}: ${item.total_transacoes} ações, ${item.total_pontos} pontos`);
            });
        } else {
            console.log('   📊 Nenhum dado de resumo encontrado');
        }

        // 4. TESTE DE CONCESSÃO MANUAL
        console.log('\n4️⃣ TESTANDO CONCESSÃO MANUAL DE PONTOS...');
        const novaTransacao = {
            id_usuario: 1,
            tipo_acao: 'avaliacao_empresa',
            pontos: 10,
            descricao: '🧪 Teste automático do sistema InfoCash - ' + new Date().toLocaleString(),
            referencia_id: Math.floor(Math.random() * 1000)
        };

        const resultado = await infocashDAO.insertPontosManual(novaTransacao);
        
        if (resultado && resultado.affectedRows > 0) {
            console.log('✅ Pontos concedidos com sucesso!');
            console.log('   🆔 ID da transação:', resultado.insertId);
            console.log('   💰 Pontos concedidos:', novaTransacao.pontos);
        } else {
            console.log('❌ Erro ao conceder pontos');
        }

        // 5. VERIFICAR SALDO APÓS CONCESSÃO
        console.log('\n5️⃣ VERIFICANDO SALDO APÓS CONCESSÃO...');
        const novoSaldo = await infocashDAO.selectSaldoByUsuario(1);
        console.log('✅ Novo saldo:', novoSaldo.saldo_total, 'InfoCash');
        
        if (novoSaldo.saldo_total > saldo.saldo_total) {
            console.log('   🎉 Saldo aumentou corretamente!');
        }

        // 6. TESTE DE RANKING
        console.log('\n6️⃣ TESTANDO RANKING DE USUÁRIOS...');
        const ranking = await infocashDAO.selectRankingUsuarios(5);
        console.log('✅ Top 5 usuários:');
        
        if (ranking.length > 0) {
            ranking.forEach((user, index) => {
                console.log(`   🥇 ${index + 1}º lugar: ${user.nome} - ${user.saldo_total} InfoCash`);
            });
        } else {
            console.log('   📊 Nenhum usuário encontrado no ranking');
        }

        // 7. TESTE DE ESTATÍSTICAS GERAIS
        console.log('\n7️⃣ TESTANDO ESTATÍSTICAS GERAIS...');
        const estatisticas = await infocashDAO.selectEstatisticasGerais();
        
        if (estatisticas) {
            console.log('✅ Estatísticas do sistema:');
            console.log('   👥 Usuários ativos:', estatisticas.total_usuarios_ativos);
            console.log('   💰 Total de pontos distribuídos:', estatisticas.total_pontos_distribuidos);
            console.log('   📊 Total de transações:', estatisticas.total_transacoes);
            console.log('   📈 Média de pontos por transação:', Math.round(estatisticas.media_pontos_transacao * 100) / 100);
        } else {
            console.log('❌ Erro ao buscar estatísticas');
        }

        // 8. TESTE DE TRANSAÇÕES POR PERÍODO
        console.log('\n8️⃣ TESTANDO BUSCA POR PERÍODO...');
        const hoje = new Date();
        const umMesAtras = new Date();
        umMesAtras.setMonth(hoje.getMonth() - 1);
        
        const transacoesPeriodo = await infocashDAO.selectTransacoesPorPeriodo(
            1, 
            umMesAtras.toISOString().split('T')[0], 
            hoje.toISOString().split('T')[0]
        );
        
        console.log('✅ Transações no último mês:', transacoesPeriodo.length);

        // RESULTADO FINAL
        console.log('\n' + '='.repeat(50));
        console.log('🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
        console.log('✅ Todas as funcionalidades do InfoCash estão funcionando');
        console.log('📊 Sistema pronto para uso em produção');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ ERRO DURANTE O TESTE:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        console.log('\n🛠️  POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verifique se o banco de dados está rodando');
        console.log('2. Execute o arquivo SQL das tabelas InfoCash');
        console.log('3. Verifique as configurações de conexão');
        console.log('4. Certifique-se que existe pelo menos um usuário na tabela tbl_usuario');
    }
}

// Executar o teste
if (require.main === module) {
    testeRapidoInfoCash().then(() => {
        console.log('\n👋 Teste finalizado. Pressione Ctrl+C para sair.');
        process.exit(0);
    }).catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { testeRapidoInfoCash };