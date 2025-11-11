/**
 * Testes Unitários da Rede Social
 * Testa todas as funcionalidades da rede social com Jest
 */

const request = require('supertest');
const app = require('../../app.js');
const postDAO = require('../../model/DAO/post.js');

describe('Rede Social InfoHub - Testes Completos', () => {
    
    // Dados de teste
    let testUserId = 1;
    let testPostId = null;
    let testComentarioId = null;
    
    beforeAll(async () => {
        console.log('🚀 Iniciando testes da Rede Social...');
    });
    
    afterAll(async () => {
        // Cleanup - limpar dados de teste
        if (testPostId) {
            await postDAO.deletePost(testPostId);
        }
        console.log('✅ Testes da Rede Social concluídos');
    });

    describe('1️⃣ Testes do DAO de Posts', () => {
        
        test('Deve criar um post', async () => {
            const novoPost = {
                id_usuario: testUserId,
                conteudo: 'Post de teste unitário - ' + Date.now(),
                foto_url: null,
                id_produto: null,
                id_estabelecimento: null
            };

            const postCriado = await postDAO.insertPost(novoPost);
            
            expect(postCriado).toBeDefined();
            expect(postCriado.id_post).toBeDefined();
            expect(postCriado.conteudo).toBe(novoPost.conteudo);
            expect(postCriado.id_usuario).toBe(testUserId);
            
            testPostId = postCriado.id_post;
        });

        test('Deve buscar post por ID', async () => {
            if (!testPostId) return;

            const postEncontrado = await postDAO.selectPostById(testPostId);
            
            expect(postEncontrado).toBeDefined();
            expect(postEncontrado.id_post).toBe(testPostId);
            expect(postEncontrado).toHaveProperty('nome_usuario');
            expect(postEncontrado).toHaveProperty('total_comentarios');
            expect(postEncontrado).toHaveProperty('total_curtidas');
        });

        test('Deve listar posts do usuário', async () => {
            const postsUsuario = await postDAO.selectPostsUsuario(testUserId);
            
            expect(Array.isArray(postsUsuario) || postsUsuario === false).toBe(true);
            
            if (postsUsuario) {
                expect(postsUsuario.length).toBeGreaterThan(0);
                expect(postsUsuario[0]).toHaveProperty('id_post');
                expect(postsUsuario[0]).toHaveProperty('nome_usuario');
            }
        });

        test('Deve listar posts no feed', async () => {
            const feed = await postDAO.selectAllPosts(10, 0);
            
            expect(Array.isArray(feed) || feed === false).toBe(true);
            
            if (feed) {
                expect(feed.length).toBeGreaterThanOrEqual(0);
                if (feed.length > 0) {
                    expect(feed[0]).toHaveProperty('id_post');
                    expect(feed[0]).toHaveProperty('nome_usuario');
                    expect(feed[0]).toHaveProperty('conteudo');
                }
            }
        });

        test('Deve atualizar post', async () => {
            if (!testPostId) return;

            const dadosAtualizacao = {
                id_post: testPostId,
                conteudo: 'Post atualizado - teste unitário'
            };

            const resultado = await postDAO.updatePost(dadosAtualizacao);
            
            expect(resultado).toBe(true);
            
            // Verificar se foi realmente atualizado
            const postAtualizado = await postDAO.selectPostById(testPostId);
            expect(postAtualizado.conteudo).toBe(dadosAtualizacao.conteudo);
        });
    });

    describe('2️⃣ Testes do Sistema de Comentários', () => {
        
        test('Deve criar comentário', async () => {
            if (!testPostId) return;

            const novoComentario = {
                id_post: testPostId,
                id_usuario: testUserId,
                conteudo: 'Comentário de teste unitário'
            };

            const comentarioCriado = await postDAO.insertComentario(novoComentario);
            
            expect(comentarioCriado).toBeDefined();
            expect(comentarioCriado.id_comentario).toBeDefined();
            expect(comentarioCriado.conteudo).toBe(novoComentario.conteudo);
            expect(comentarioCriado).toHaveProperty('nome_usuario');
            
            testComentarioId = comentarioCriado.id_comentario;
        });

        test('Deve listar comentários do post', async () => {
            if (!testPostId) return;

            const comentarios = await postDAO.selectComentariosPost(testPostId);
            
            expect(Array.isArray(comentarios) || comentarios === false).toBe(true);
            
            if (comentarios) {
                expect(comentarios.length).toBeGreaterThan(0);
                expect(comentarios[0]).toHaveProperty('id_comentario');
                expect(comentarios[0]).toHaveProperty('conteudo');
                expect(comentarios[0]).toHaveProperty('nome_usuario');
            }
        });

        test('Deve deletar comentário', async () => {
            if (!testComentarioId) return;

            const resultado = await postDAO.deleteComentario(testComentarioId);
            
            expect(resultado).toBe(true);
        });
    });

    describe('3️⃣ Testes do Sistema de Curtidas', () => {
        
        test('Deve adicionar curtida', async () => {
            if (!testPostId) return;

            const resultado = await postDAO.toggleCurtida(testPostId, testUserId);
            
            expect(resultado).toBeDefined();
            expect(resultado.curtido).toBe(true);
            expect(resultado.acao).toBe('adicionada');
        });

        test('Deve contar curtidas', async () => {
            if (!testPostId) return;

            const totalCurtidas = await postDAO.countCurtidasPost(testPostId);
            
            expect(typeof totalCurtidas).toBe('number');
            expect(totalCurtidas).toBeGreaterThanOrEqual(0);
        });

        test('Deve verificar se usuário curtiu', async () => {
            if (!testPostId) return;

            const curtiu = await postDAO.verificarCurtidaUsuario(testPostId, testUserId);
            
            expect(typeof curtiu).toBe('boolean');
            expect(curtiu).toBe(true); // Deve ser true pois curtimos no teste anterior
        });

        test('Deve remover curtida', async () => {
            if (!testPostId) return;

            const resultado = await postDAO.toggleCurtida(testPostId, testUserId);
            
            expect(resultado).toBeDefined();
            expect(resultado.curtido).toBe(false);
            expect(resultado.acao).toBe('removida');
        });
    });

    describe('4️⃣ Testes das APIs da Rede Social', () => {
        
        let apiPostId = null;

        test('POST /posts - Deve criar post via API', async () => {
            const novoPost = {
                id_usuario: testUserId,
                conteudo: 'Post via API de teste'
            };

            const response = await request(app)
                .post('/posts')
                .send(novoPost)
                .expect(201);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('id_post');
            expect(response.body.data.conteudo).toBe(novoPost.conteudo);
            
            apiPostId = response.body.data.id_post;
        });

        test('GET /post/:id - Deve buscar post via API', async () => {
            if (!apiPostId) return;

            const response = await request(app)
                .get(`/post/${apiPostId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.data.post).toHaveProperty('id_post');
            expect(response.body.data.post.id_post).toBe(apiPostId);
            expect(response.body.data).toHaveProperty('comentarios');
        });

        test('GET /posts/feed - Deve listar feed via API', async () => {
            const response = await request(app)
                .get('/posts/feed')
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('GET /posts/usuario/:id - Deve listar posts do usuário via API', async () => {
            const response = await request(app)
                .get(`/posts/usuario/${testUserId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('POST /post/:id/comentario - Deve comentar via API', async () => {
            if (!apiPostId) return;

            const novoComentario = {
                id_usuario: testUserId,
                conteudo: 'Comentário via API'
            };

            const response = await request(app)
                .post(`/post/${apiPostId}/comentario`)
                .send(novoComentario)
                .expect(201);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('id_comentario');
            expect(response.body.data.conteudo).toBe(novoComentario.conteudo);
        });

        test('POST /post/:id/curtir - Deve curtir via API', async () => {
            if (!apiPostId) return;

            const curtirData = {
                id_usuario: testUserId
            };

            const response = await request(app)
                .post(`/post/${apiPostId}/curtir`)
                .send(curtirData)
                .expect(200);

            expect(response.body.status).toBe(true);
            expect(response.body.data).toHaveProperty('curtido');
            expect(response.body.data).toHaveProperty('total_curtidas');
        });

        test('PUT /post/:id - Deve atualizar post via API', async () => {
            if (!apiPostId) return;

            const postAtualizado = {
                conteudo: 'Post atualizado via API'
            };

            const response = await request(app)
                .put(`/post/${apiPostId}`)
                .send(postAtualizado)
                .expect(200);

            expect(response.body.status).toBe(true);
        });

        test('DELETE /post/:id - Deve deletar post via API', async () => {
            if (!apiPostId) return;

            const response = await request(app)
                .delete(`/post/${apiPostId}`)
                .expect(200);

            expect(response.body.status).toBe(true);
        });
    });

    describe('5️⃣ Testes de Validação', () => {
        
        test('Deve rejeitar post sem conteúdo', async () => {
            const postInvalido = {
                id_usuario: testUserId
                // Sem conteúdo
            };

            const response = await request(app)
                .post('/posts')
                .send(postInvalido)
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toContain('obrigatórios');
        });

        test('Deve rejeitar post com conteúdo muito longo', async () => {
            const postLongo = {
                id_usuario: testUserId,
                conteudo: 'A'.repeat(501) // Mais que 500 caracteres
            };

            const response = await request(app)
                .post('/posts')
                .send(postLongo)
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toContain('caracteres');
        });

        test('Deve rejeitar comentário muito longo', async () => {
            if (!testPostId) return;

            const comentarioLongo = {
                id_usuario: testUserId,
                conteudo: 'A'.repeat(201) // Mais que 200 caracteres
            };

            const response = await request(app)
                .post(`/post/${testPostId}/comentario`)
                .send(comentarioLongo)
                .expect(400);

            expect(response.body.status).toBe(false);
            expect(response.body.message).toContain('caracteres');
        });

        test('Deve rejeitar busca de post inexistente', async () => {
            const response = await request(app)
                .get('/post/99999')
                .expect(404);

            expect(response.body.status).toBe(false);
        });
    });

    describe('6️⃣ Testes de Posts Relacionados', () => {
        
        test('Deve criar post relacionado a produto', async () => {
            const postComProduto = {
                id_usuario: testUserId,
                conteudo: 'Post sobre produto de teste',
                id_produto: 1
            };

            const postCriado = await postDAO.insertPost(postComProduto);
            
            if (postCriado) {
                expect(postCriado.id_produto).toBe(1);
                
                // Buscar posts do produto
                const postsProduto = await postDAO.selectPostsProduto(1);
                expect(Array.isArray(postsProduto) || postsProduto === false).toBe(true);
                
                // Limpar
                await postDAO.deletePost(postCriado.id_post);
            }
        });

        test('Deve criar post relacionado a estabelecimento', async () => {
            const postComEstab = {
                id_usuario: testUserId,
                conteudo: 'Post sobre estabelecimento de teste',
                id_estabelecimento: 1
            };

            const postCriado = await postDAO.insertPost(postComEstab);
            
            if (postCriado) {
                expect(postCriado.id_estabelecimento).toBe(1);
                
                // Buscar posts do estabelecimento
                const postsEstab = await postDAO.selectPostsEstabelecimento(1);
                expect(Array.isArray(postsEstab) || postsEstab === false).toBe(true);
                
                // Limpar
                await postDAO.deletePost(postCriado.id_post);
            }
        });
    });

    describe('7️⃣ Testes de Performance e Integridade', () => {
        
        test('Feed deve carregar rapidamente', async () => {
            const inicio = Date.now();
            
            const feed = await postDAO.selectAllPosts(20, 0);
            
            const tempo = Date.now() - inicio;
            
            expect(tempo).toBeLessThan(3000); // Menos que 3 segundos
            expect(Array.isArray(feed) || feed === false).toBe(true);
        });

        test('Deve manter integridade ao deletar post com comentários e curtidas', async () => {
            // Criar post temporário
            const postTemp = await postDAO.insertPost({
                id_usuario: testUserId,
                conteudo: 'Post temporário para teste de integridade'
            });

            if (postTemp) {
                const postId = postTemp.id_post;

                // Adicionar comentário e curtida
                await postDAO.insertComentario({
                    id_post: postId,
                    id_usuario: testUserId,
                    conteudo: 'Comentário temporário'
                });

                await postDAO.toggleCurtida(postId, testUserId);

                // Deletar post (deve deletar comentários e curtidas em cascata)
                const resultado = await postDAO.deletePost(postId);
                expect(resultado).toBe(true);

                // Verificar se comentários foram removidos
                const comentarios = await postDAO.selectComentariosPost(postId);
                expect(comentarios).toBe(false);
            }
        });

        test('Contadores devem ser precisos', async () => {
            if (!testPostId) return;

            // Adicionar curtida
            await postDAO.toggleCurtida(testPostId, testUserId);
            
            // Verificar contador
            const totalCurtidas = await postDAO.countCurtidasPost(testPostId);
            const verificacao = await postDAO.verificarCurtidaUsuario(testPostId, testUserId);
            
            expect(totalCurtidas).toBeGreaterThan(0);
            expect(verificacao).toBe(true);

            // Remover curtida
            await postDAO.toggleCurtida(testPostId, testUserId);
            
            // Verificar novamente
            const novoTotal = await postDAO.countCurtidasPost(testPostId);
            const novaVerificacao = await postDAO.verificarCurtidaUsuario(testPostId, testUserId);
            
            expect(novoTotal).toBe(totalCurtidas - 1);
            expect(novaVerificacao).toBe(false);
        });
    });
});

// Função auxiliar para executar teste manual da rede social
async function executarTesteManualRedeSocial() {
    console.log('\n📱 EXECUTANDO TESTE MANUAL DA REDE SOCIAL\n');
    
    try {
        // 1. Testar criação de post
        console.log('📝 Testando criação de post...');
        const novoPost = {
            id_usuario: 1,
            conteudo: 'Post de teste manual - ' + Date.now()
        };
        
        const postCriado = await postDAO.insertPost(novoPost);
        console.log('✅ Post criado:', postCriado ? postCriado.id_post : 'Erro');
        
        if (postCriado) {
            const postId = postCriado.id_post;
            
            // 2. Testar comentário
            console.log('💬 Testando comentário...');
            const comentario = await postDAO.insertComentario({
                id_post: postId,
                id_usuario: 1,
                conteudo: 'Comentário de teste manual'
            });
            console.log('✅ Comentário criado:', comentario ? comentario.id_comentario : 'Erro');
            
            // 3. Testar curtida
            console.log('❤️ Testando curtida...');
            const curtida = await postDAO.toggleCurtida(postId, 1);
            console.log('✅ Curtida:', curtida ? curtida.acao : 'Erro');
            
            // 4. Testar feed
            console.log('📊 Testando feed...');
            const feed = await postDAO.selectAllPosts(5, 0);
            console.log('✅ Feed:', feed ? feed.length + ' posts' : 'Erro');
            
            // 5. Limpar
            console.log('🧹 Limpando teste...');
            await postDAO.deletePost(postId);
            console.log('✅ Post deletado');
        }
        
        console.log('\n🎉 TESTE MANUAL DA REDE SOCIAL CONCLUÍDO!\n');
        
    } catch (error) {
        console.error('❌ Erro no teste manual:', error.message);
    }
}

module.exports = { executarTesteManualRedeSocial };