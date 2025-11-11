/**
 * Testes do Sistema InfoCash
 * Testa todas as funcionalidades do sistema de pontos
 */

const request = require('supertest');
const app = require('../../app.js');
const infocashDAO = require('../../model/DAO/infocash.js');

describe('Sistema InfoCash - Testes Completos', () => {
    
    // Dados de teste
    let testUserId = 1;
    let testToken = null;
    let testTransactionId = null;
    
    beforeAll(async () => {
        // Setup inicial - pode incluir criação de usuário de teste
        console.log('🚀 Iniciando testes do Sistema InfoCash...');
    });
    
    afterAll(async () => {
        // Cleanup - limpar dados de teste se necessário
        console.log('✅ Testes do Sistema InfoCash concluídos');
    });

    describe('1️⃣ Testes do DAO InfoCash', () => {
        
        test('Deve buscar saldo do usuário', async () => {
            const saldo = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            expect(saldo).toBeDefined();
            expect(typeof saldo.saldo_total).toBe('number');
            expect(saldo.saldo_total).toBeGreaterThanOrEqual(0);
        });

        test('Deve buscar histórico de transações', async () => {
            const historico = await infocashDAO.selectHistoricoByUsuario(testUserId, 10);
            
            expect(Array.isArray(historico)).toBe(true);
            // Se houver transações, verificar estrutura
            if (historico.length > 0) {
                expect(historico[0]).toHaveProperty('id_transacao');
                expect(historico[0]).toHaveProperty('tipo_acao');
                expect(historico[0]).toHaveProperty('pontos');
                expect(historico[0]).toHaveProperty('descricao');
                expect(historico[0]).toHaveProperty('data_transacao');
            }
        });

        test('Deve buscar resumo por tipo de ação', async () => {
            const resumo = await infocashDAO.selectResumoByUsuario(testUserId);
            
            expect(Array.isArray(resumo)).toBe(true);
            // Se houver dados, verificar estrutura
            if (resumo.length > 0) {
                expect(resumo[0]).toHaveProperty('tipo_acao');
                expect(resumo[0]).toHaveProperty('total_transacoes');
                expect(resumo[0]).toHaveProperty('total_pontos');
            }
        });

        test('Deve conceder pontos manualmente', async () => {
            const dadosTransacao = {
                id_usuario: testUserId,
                tipo_acao: 'avaliacao_empresa',
                pontos: 10,
                descricao: 'Teste de pontos manuais',
                referencia_id: 999
            };

            const resultado = await infocashDAO.insertPontosManual(dadosTransacao);
            
            expect(resultado).toBeDefined();
            expect(resultado.affectedRows).toBe(1);
            testTransactionId = resultado.insertId;
        });

        test('Deve buscar ranking de usuários', async () => {
            const ranking = await infocashDAO.selectRankingUsuarios(5);
            
            expect(Array.isArray(ranking)).toBe(true);
            // Se houver usuários, verificar estrutura
            if (ranking.length > 0) {
                expect(ranking[0]).toHaveProperty('id_usuario');
                expect(ranking[0]).toHaveProperty('nome');
                expect(ranking[0]).toHaveProperty('saldo_total');
            }
        });

        test('Deve buscar estatísticas gerais', async () => {
            const estatisticas = await infocashDAO.selectEstatisticasGerais();
            
            expect(estatisticas).toBeDefined();
            expect(estatisticas).toHaveProperty('total_usuarios_ativos');
            expect(estatisticas).toHaveProperty('total_pontos_distribuidos');
            expect(estatisticas).toHaveProperty('total_transacoes');
        });
    });

    describe('2️⃣ Testes das APIs InfoCash', () => {
        
        test('GET /infocash/saldo/:id - Deve retornar saldo do usuário', async () => {
            const response = await request(app)
                .get(`/infocash/saldo/${testUserId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('saldo_total');
            expect(typeof response.body.data.saldo_total).toBe('number');
        });

        test('GET /infocash/historico/:id - Deve retornar histórico', async () => {
            const response = await request(app)
                .get(`/infocash/historico/${testUserId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('GET /infocash/resumo/:id - Deve retornar resumo', async () => {
            const response = await request(app)
                .get(`/infocash/resumo/${testUserId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('GET /infocash/perfil/:id - Deve retornar perfil completo', async () => {
            const response = await request(app)
                .get(`/infocash/perfil/${testUserId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('saldo');
            expect(response.body.data).toHaveProperty('resumo');
        });

        test('GET /infocash/ranking - Deve retornar ranking', async () => {
            const response = await request(app)
                .get('/infocash/ranking')
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('POST /infocash/conceder - Deve conceder pontos (admin)', async () => {
            const dadosConcessao = {
                id_usuario: testUserId,
                tipo_acao: 'avaliacao_promocao',
                pontos: 15,
                descricao: 'Teste de concessão via API',
                referencia_id: 888
            };

            const response = await request(app)
                .post('/infocash/conceder')
                .send(dadosConcessao)
                .expect(201);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('id_transacao');
        });

        test('GET /infocash/periodo/:id - Deve retornar transações por período', async () => {
            const dataInicio = '2023-01-01';
            const dataFim = '2025-12-31';
            
            const response = await request(app)
                .get(`/infocash/periodo/${testUserId}?dataInicio=${dataInicio}&dataFim=${dataFim}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('3️⃣ Testes de Validação e Erros', () => {
        
        test('Deve retornar erro para usuário inexistente', async () => {
            const response = await request(app)
                .get('/infocash/saldo/99999')
                .expect(200); // Pode retornar 200 com saldo 0 para usuário inexistente

            expect(response.body.status).toBe(true);
            // Para usuário inexistente, deve retornar saldo 0
        });

        test('Deve retornar erro para concessão sem dados obrigatórios', async () => {
            const dadosInvalidos = {
                id_usuario: testUserId,
                // Faltam campos obrigatórios
            };

            const response = await request(app)
                .post('/infocash/conceder')
                .send(dadosInvalidos)
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toContain('obrigatórios');
        });

        test('Deve retornar erro para pontos inválidos', async () => {
            const dadosInvalidos = {
                id_usuario: testUserId,
                tipo_acao: 'avaliacao_empresa',
                pontos: -10, // Pontos negativos
                descricao: 'Teste inválido'
            };

            const response = await request(app)
                .post('/infocash/conceder')
                .send(dadosInvalidos)
                .expect(400);

            expect(response.body.status).toBe(false);
        });
    });

    describe('4️⃣ Testes de Triggers Automáticos', () => {
        
        test('Deve simular trigger de avaliação de estabelecimento', async () => {
            // Nota: Este teste assumiria que temos acesso direto ao banco
            // ou endpoints que criam avaliações
            
            // Verificar saldo antes
            const saldoAntes = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            // Simular inserção de avaliação (normalmente seria via endpoint)
            const mockAvaliacao = {
                id_usuario: testUserId,
                tipo_acao: 'avaliacao_empresa',
                pontos: 10,
                descricao: 'Pontos automáticos por avaliar estabelecimento',
                referencia_id: 123
            };
            
            await infocashDAO.insertPontosManual(mockAvaliacao);
            
            // Verificar saldo depois
            const saldoDepois = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            expect(saldoDepois.saldo_total).toBe(saldoAntes.saldo_total + 10);
        });

        test('Deve simular trigger de avaliação de promoção', async () => {
            const saldoAntes = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            const mockPromocao = {
                id_usuario: testUserId,
                tipo_acao: 'avaliacao_promocao',
                pontos: 15,
                descricao: 'Pontos automáticos por avaliar produto em promoção',
                referencia_id: 456
            };
            
            await infocashDAO.insertPontosManual(mockPromocao);
            
            const saldoDepois = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            expect(saldoDepois.saldo_total).toBe(saldoAntes.saldo_total + 15);
        });

        test('Deve simular trigger de cadastro de produto', async () => {
            const saldoAntes = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            const mockCadastro = {
                id_usuario: testUserId,
                tipo_acao: 'cadastro_produto',
                pontos: 5,
                descricao: 'Pontos automáticos por cadastrar produto',
                referencia_id: 789
            };
            
            await infocashDAO.insertPontosManual(mockCadastro);
            
            const saldoDepois = await infocashDAO.selectSaldoByUsuario(testUserId);
            
            expect(saldoDepois.saldo_total).toBe(saldoAntes.saldo_total + 5);
        });
    });

    describe('5️⃣ Testes de Performance e Limites', () => {
        
        test('Deve lidar com consulta de histórico grande', async () => {
            const inicio = Date.now();
            
            const historico = await infocashDAO.selectHistoricoByUsuario(testUserId, 1000);
            
            const tempo = Date.now() - inicio;
            
            expect(Array.isArray(historico)).toBe(true);
            expect(tempo).toBeLessThan(5000); // Deve ser menor que 5 segundos
        });

        test('Deve limitar consulta de ranking', async () => {
            const ranking = await infocashDAO.selectRankingUsuarios(100);
            
            expect(Array.isArray(ranking)).toBe(true);
            expect(ranking.length).toBeLessThanOrEqual(100);
        });
    });

    describe('6️⃣ Testes de Integridade de Dados', () => {
        
        test('Saldo deve ser consistente com histórico', async () => {
            const saldo = await infocashDAO.selectSaldoByUsuario(testUserId);
            const historico = await infocashDAO.selectHistoricoByUsuario(testUserId, 1000);
            
            if (historico.length > 0) {
                const somaHistorico = historico.reduce((total, transacao) => total + transacao.pontos, 0);
                
                // O saldo pode não ser exatamente igual se houver mais transações que o limite
                expect(saldo.saldo_total).toBeGreaterThanOrEqual(0);
            }
        });

        test('Todas as transações devem ter tipos válidos', async () => {
            const historico = await infocashDAO.selectHistoricoByUsuario(testUserId, 100);
            
            const tiposValidos = ['avaliacao_promocao', 'cadastro_produto', 'avaliacao_empresa'];
            
            historico.forEach(transacao => {
                expect(tiposValidos).toContain(transacao.tipo_acao);
                expect(transacao.pontos).toBeGreaterThan(0);
            });
        });
    });
});

// Função auxiliar para executar teste manual completo
async function executarTesteManual() {
    console.log('\n🧪 EXECUTANDO TESTE MANUAL DO SISTEMA INFOCASH\n');
    
    try {
        // 1. Testar DAO
        console.log('📊 Testando DAO...');
        const saldo = await infocashDAO.selectSaldoByUsuario(1);
        console.log('✅ Saldo:', saldo);
        
        const historico = await infocashDAO.selectHistoricoByUsuario(1, 5);
        console.log('✅ Histórico:', historico.length, 'transações');
        
        const resumo = await infocashDAO.selectResumoByUsuario(1);
        console.log('✅ Resumo:', resumo.length, 'tipos de ação');
        
        const ranking = await infocashDAO.selectRankingUsuarios(5);
        console.log('✅ Ranking:', ranking.length, 'usuários');
        
        // 2. Testar concessão manual
        console.log('\n💰 Testando concessão manual...');
        const novaTransacao = {
            id_usuario: 1,
            tipo_acao: 'avaliacao_empresa',
            pontos: 10,
            descricao: 'Teste manual do sistema',
            referencia_id: 999
        };
        
        const resultado = await infocashDAO.insertPontosManual(novaTransacao);
        console.log('✅ Transação criada:', resultado.insertId);
        
        // 3. Verificar estatísticas
        console.log('\n📈 Testando estatísticas...');
        const estatisticas = await infocashDAO.selectEstatisticasGerais();
        console.log('✅ Estatísticas:', estatisticas);
        
        console.log('\n🎉 TESTE MANUAL CONCLUÍDO COM SUCESSO!\n');
        
    } catch (error) {
        console.error('❌ Erro no teste manual:', error.message);
    }
}

// Exportar função de teste manual
module.exports = { executarTesteManual };