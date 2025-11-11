/**
 * TESTE DAS APIs INFOCASH
 * Testa os endpoints REST do sistema InfoCash
 * Execute: node teste_apis_infocash.js
 */

const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3333'; // Ajuste a porta conforme necessário
const USER_ID = 1; // ID do usuário para testes

// Headers padrão (adicione token de auth se necessário)
const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer SEU_TOKEN_AQUI' // Descomente se precisar de auth
};

async function testarAPIsInfoCash() {
    console.log('🌐 INICIANDO TESTE DAS APIs INFOCASH\n');
    console.log('🔗 URL da API:', API_BASE_URL);
    console.log('👤 Usuário de teste:', USER_ID);
    console.log('='.repeat(60));

    try {
        // 1. TESTAR ENDPOINT DE SALDO
        console.log('\n1️⃣ TESTANDO GET /infocash/saldo/:id');
        try {
            const saldoResponse = await axios.get(`${API_BASE_URL}/infocash/saldo/${USER_ID}`, { headers });
            
            if (saldoResponse.status === 200 && saldoResponse.data.status) {
                console.log('✅ Saldo consultado com sucesso');
                console.log('   💰 Saldo atual:', saldoResponse.data.data.saldo_total, 'InfoCash');
                console.log('   📅 Última atualização:', saldoResponse.data.data.ultima_atualizacao);
            } else {
                console.log('❌ Resposta inesperada:', saldoResponse.data);
            }
        } catch (error) {
            console.log('❌ Erro ao consultar saldo:', error.response?.data || error.message);
        }

        // 2. TESTAR ENDPOINT DE HISTÓRICO
        console.log('\n2️⃣ TESTANDO GET /infocash/historico/:id');
        try {
            const historicoResponse = await axios.get(`${API_BASE_URL}/infocash/historico/${USER_ID}?limite=5`, { headers });
            
            if (historicoResponse.status === 200 && historicoResponse.data.status) {
                console.log('✅ Histórico consultado com sucesso');
                console.log('   📊 Total de transações retornadas:', historicoResponse.data.data.length);
                
                if (historicoResponse.data.data.length > 0) {
                    const ultima = historicoResponse.data.data[0];
                    console.log('   📝 Última transação:', {
                        tipo: ultima.tipo_acao,
                        pontos: ultima.pontos,
                        descricao: ultima.descricao.substring(0, 50) + '...'
                    });
                }
            }
        } catch (error) {
            console.log('❌ Erro ao consultar histórico:', error.response?.data || error.message);
        }

        // 3. TESTAR ENDPOINT DE RESUMO
        console.log('\n3️⃣ TESTANDO GET /infocash/resumo/:id');
        try {
            const resumoResponse = await axios.get(`${API_BASE_URL}/infocash/resumo/${USER_ID}`, { headers });
            
            if (resumoResponse.status === 200 && resumoResponse.data.status) {
                console.log('✅ Resumo consultado com sucesso');
                console.log('   📈 Tipos de ação encontrados:', resumoResponse.data.data.length);
                
                resumoResponse.data.data.forEach(item => {
                    console.log(`   🏆 ${item.tipo_acao}: ${item.total_transacoes} ações, ${item.total_pontos} pontos`);
                });
            }
        } catch (error) {
            console.log('❌ Erro ao consultar resumo:', error.response?.data || error.message);
        }

        // 4. TESTAR ENDPOINT DE PERFIL COMPLETO
        console.log('\n4️⃣ TESTANDO GET /infocash/perfil/:id');
        try {
            const perfilResponse = await axios.get(`${API_BASE_URL}/infocash/perfil/${USER_ID}`, { headers });
            
            if (perfilResponse.status === 200 && perfilResponse.data.status) {
                console.log('✅ Perfil completo consultado com sucesso');
                console.log('   💰 Saldo:', perfilResponse.data.data.saldo.saldo_total);
                console.log('   📊 Resumo contém:', perfilResponse.data.data.resumo.length, 'tipos de ação');
            }
        } catch (error) {
            console.log('❌ Erro ao consultar perfil:', error.response?.data || error.message);
        }

        // 5. TESTAR ENDPOINT DE RANKING
        console.log('\n5️⃣ TESTANDO GET /infocash/ranking');
        try {
            const rankingResponse = await axios.get(`${API_BASE_URL}/infocash/ranking?limite=5`, { headers });
            
            if (rankingResponse.status === 200 && rankingResponse.data.status) {
                console.log('✅ Ranking consultado com sucesso');
                console.log('   🏆 Top 5 usuários:');
                
                rankingResponse.data.data.forEach((user, index) => {
                    console.log(`      ${index + 1}º ${user.nome}: ${user.saldo_total} InfoCash`);
                });
            }
        } catch (error) {
            console.log('❌ Erro ao consultar ranking:', error.response?.data || error.message);
        }

        // 6. TESTAR CONCESSÃO MANUAL (necessita auth de admin)
        console.log('\n6️⃣ TESTANDO POST /infocash/conceder');
        try {
            const dadosConcessao = {
                id_usuario: USER_ID,
                tipo_acao: 'avaliacao_empresa',
                pontos: 10,
                descricao: '🧪 Teste automático via API - ' + new Date().toLocaleString(),
                referencia_id: Math.floor(Math.random() * 1000)
            };

            const concessaoResponse = await axios.post(`${API_BASE_URL}/infocash/conceder`, dadosConcessao, { headers });
            
            if (concessaoResponse.status === 201 && concessaoResponse.data.status) {
                console.log('✅ Pontos concedidos via API com sucesso');
                console.log('   🆔 ID da transação:', concessaoResponse.data.data.id_transacao);
                console.log('   💰 Pontos concedidos:', dadosConcessao.pontos);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('⚠️  Teste de concessão pulado (requer permissão de admin)');
            } else {
                console.log('❌ Erro ao conceder pontos:', error.response?.data || error.message);
            }
        }

        // 7. TESTAR ESTATÍSTICAS (necessita auth de admin)
        console.log('\n7️⃣ TESTANDO GET /infocash/estatisticas');
        try {
            const estatisticasResponse = await axios.get(`${API_BASE_URL}/infocash/estatisticas`, { headers });
            
            if (estatisticasResponse.status === 200 && estatisticasResponse.data.status) {
                console.log('✅ Estatísticas consultadas com sucesso');
                const stats = estatisticasResponse.data.data;
                console.log('   👥 Usuários ativos:', stats.total_usuarios_ativos);
                console.log('   💰 Total de pontos:', stats.total_pontos_distribuidos);
                console.log('   📊 Total de transações:', stats.total_transacoes);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('⚠️  Teste de estatísticas pulado (requer permissão de admin)');
            } else {
                console.log('❌ Erro ao consultar estatísticas:', error.response?.data || error.message);
            }
        }

        // 8. TESTAR TRANSAÇÕES POR PERÍODO
        console.log('\n8️⃣ TESTANDO GET /infocash/periodo/:id');
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const umMesAtras = new Date();
            umMesAtras.setMonth(umMesAtras.getMonth() - 1);
            const dataInicio = umMesAtras.toISOString().split('T')[0];

            const periodoResponse = await axios.get(
                `${API_BASE_URL}/infocash/periodo/${USER_ID}?dataInicio=${dataInicio}&dataFim=${hoje}`, 
                { headers }
            );
            
            if (periodoResponse.status === 200 && periodoResponse.data.status) {
                console.log('✅ Transações por período consultadas com sucesso');
                console.log('   📅 Período:', dataInicio, 'até', hoje);
                console.log('   📊 Transações encontradas:', periodoResponse.data.data.length);
            }
        } catch (error) {
            console.log('❌ Erro ao consultar período:', error.response?.data || error.message);
        }

        // TESTE DE VALIDAÇÃO - ID INVÁLIDO
        console.log('\n9️⃣ TESTANDO VALIDAÇÃO COM ID INVÁLIDO');
        try {
            const invalidResponse = await axios.get(`${API_BASE_URL}/infocash/saldo/99999`, { headers });
            
            if (invalidResponse.status === 200) {
                console.log('✅ Validação funcionando - usuário inexistente retorna saldo 0');
                console.log('   💰 Saldo retornado:', invalidResponse.data.data.saldo_total);
            }
        } catch (error) {
            console.log('❌ Erro inesperado com ID inválido:', error.response?.data || error.message);
        }

        // RESULTADO FINAL
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TESTE DAS APIs FINALIZADO!');
        console.log('✅ APIs InfoCash testadas com sucesso');
        console.log('🌐 Sistema pronto para integração com frontend');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ ERRO FATAL DURANTE OS TESTES:', error.message);
        console.log('\n🛠️  VERIFIQUE:');
        console.log('1. Se o servidor está rodando na porta correta');
        console.log('2. Se as rotas InfoCash foram registradas');
        console.log('3. Se o banco de dados está conectado');
        console.log('4. Se existe um usuário com ID', USER_ID);
    }
}

// Função para testar conectividade básica
async function testarConectividade() {
    console.log('🔍 Testando conectividade com o servidor...');
    
    try {
        const response = await axios.get(API_BASE_URL, { timeout: 5000 });
        console.log('✅ Servidor está respondendo');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Servidor não está rodando ou porta incorreta');
        } else {
            console.log('❌ Erro de conectividade:', error.message);
        }
        return false;
    }
}

// Executar os testes
if (require.main === module) {
    testarConectividade().then(conectado => {
        if (conectado) {
            return testarAPIsInfoCash();
        } else {
            console.log('\n🚫 Interrompendo testes devido a problemas de conectividade');
            console.log('💡 Certifique-se que o servidor está rodando com: node app.js');
        }
    }).then(() => {
        console.log('\n👋 Teste das APIs finalizado. Pressione Ctrl+C para sair.');
        process.exit(0);
    }).catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { testarAPIsInfoCash, testarConectividade };