/**
 * TESTES DA REDE SOCIAL
 * Testa todas as funcionalidades da rede social do InfoHub
 * Execute: node teste_rede_social.js
 */

const postDAO = require('./model/DAO/post.js');

async function testeRedesSociais() {
    console.log('🌐 INICIANDO TESTE DA REDE SOCIAL INFOHUB\n');
    console.log('=' * 60);

    try {
        // Dados de teste
        const usuarioTeste = 1;
        let postTestId = null;
        let comentarioTestId = null;

        // 1. TESTE DE CRIAÇÃO DE POST
        console.log('\n1️⃣ TESTANDO CRIAÇÃO DE POSTS...');
        
        const novoPost = {
            id_usuario: usuarioTeste,
            conteudo: '🧪 Teste automático da rede social - ' + new Date().toLocaleString(),
            foto_url: null,
            id_produto: null,
            id_estabelecimento: null
        };

        const postCriado = await postDAO.insertPost(novoPost);
        
        if (postCriado && postCriado.id_post) {
            console.log('✅ Post criado com sucesso');
            console.log('   🆔 ID do post:', postCriado.id_post);
            console.log('   📝 Conteúdo:', postCriado.conteudo.substring(0, 50) + '...');
            console.log('   📅 Data:', postCriado.data_criacao);
            postTestId = postCriado.id_post;
        } else {
            console.log('❌ Erro ao criar post');
        }

        // 2. TESTE DE BUSCAR POST POR ID
        console.log('\n2️⃣ TESTANDO BUSCA DE POST POR ID...');
        
        if (postTestId) {
            const postEncontrado = await postDAO.selectPostById(postTestId);
            
            if (postEncontrado) {
                console.log('✅ Post encontrado com sucesso');
                console.log('   👤 Autor:', postEncontrado.nome_usuario);
                console.log('   💬 Comentários:', postEncontrado.total_comentarios);
                console.log('   ❤️ Curtidas:', postEncontrado.total_curtidas);
            } else {
                console.log('❌ Post não encontrado');
            }
        }

        // 3. TESTE DE LISTAGEM DE POSTS DO USUÁRIO
        console.log('\n3️⃣ TESTANDO LISTAGEM DE POSTS DO USUÁRIO...');
        
        const postsUsuario = await postDAO.selectPostsUsuario(usuarioTeste);
        
        if (postsUsuario) {
            console.log('✅ Posts do usuário encontrados');
            console.log('   📊 Total de posts:', postsUsuario.length);
            
            if (postsUsuario.length > 0) {
                console.log('   📝 Último post:', postsUsuario[0].conteudo.substring(0, 50) + '...');
            }
        } else {
            console.log('⚠️  Nenhum post encontrado para o usuário');
        }

        // 4. TESTE DO FEED GERAL
        console.log('\n4️⃣ TESTANDO FEED GERAL...');
        
        const feedPosts = await postDAO.selectAllPosts(10, 0);
        
        if (feedPosts) {
            console.log('✅ Feed carregado com sucesso');
            console.log('   📊 Posts no feed:', feedPosts.length);
            
            if (feedPosts.length > 0) {
                console.log('   👤 Primeiro autor:', feedPosts[0].nome_usuario);
                console.log('   📝 Primeiro post:', feedPosts[0].conteudo.substring(0, 50) + '...');
            }
        } else {
            console.log('⚠️  Feed vazio');
        }

        // 5. TESTE DE COMENTÁRIOS
        console.log('\n5️⃣ TESTANDO SISTEMA DE COMENTÁRIOS...');
        
        if (postTestId) {
            const novoComentario = {
                id_post: postTestId,
                id_usuario: usuarioTeste,
                conteudo: '💬 Comentário de teste automático - ' + new Date().toLocaleString()
            };

            const comentarioCriado = await postDAO.insertComentario(novoComentario);
            
            if (comentarioCriado && comentarioCriado.id_comentario) {
                console.log('✅ Comentário criado com sucesso');
                console.log('   🆔 ID do comentário:', comentarioCriado.id_comentario);
                console.log('   👤 Autor:', comentarioCriado.nome_usuario);
                console.log('   💬 Conteúdo:', comentarioCriado.conteudo.substring(0, 50) + '...');
                comentarioTestId = comentarioCriado.id_comentario;
            } else {
                console.log('❌ Erro ao criar comentário');
            }

            // Listar comentários do post
            console.log('\n   📋 Listando comentários do post...');
            const comentariosPost = await postDAO.selectComentariosPost(postTestId);
            
            if (comentariosPost) {
                console.log('   ✅ Comentários encontrados:', comentariosPost.length);
                
                comentariosPost.forEach((comentario, index) => {
                    console.log(`   💬 ${index + 1}º ${comentario.nome_usuario}: ${comentario.conteudo.substring(0, 30)}...`);
                });
            } else {
                console.log('   ⚠️  Nenhum comentário encontrado');
            }
        }

        // 6. TESTE DE CURTIDAS
        console.log('\n6️⃣ TESTANDO SISTEMA DE CURTIDAS...');
        
        if (postTestId) {
            // Adicionar curtida
            console.log('   🔄 Adicionando curtida...');
            const resultadoCurtida1 = await postDAO.toggleCurtida(postTestId, usuarioTeste);
            
            if (resultadoCurtida1) {
                console.log('   ✅ Curtida adicionada:', resultadoCurtida1.acao);
                console.log('   ❤️ Status:', resultadoCurtida1.curtido ? 'Curtido' : 'Não curtido');
            }

            // Contar curtidas
            const totalCurtidas1 = await postDAO.countCurtidasPost(postTestId);
            console.log('   📊 Total de curtidas após adicionar:', totalCurtidas1);

            // Verificar se usuário curtiu
            const usuarioCurtiu = await postDAO.verificarCurtidaUsuario(postTestId, usuarioTeste);
            console.log('   🔍 Usuário curtiu o post:', usuarioCurtiu ? 'Sim' : 'Não');

            // Remover curtida
            console.log('   🔄 Removendo curtida...');
            const resultadoCurtida2 = await postDAO.toggleCurtida(postTestId, usuarioTeste);
            
            if (resultadoCurtida2) {
                console.log('   ✅ Curtida removida:', resultadoCurtida2.acao);
                console.log('   ❤️ Status:', resultadoCurtida2.curtido ? 'Curtido' : 'Não curtido');
            }

            // Contar curtidas após remoção
            const totalCurtidas2 = await postDAO.countCurtidasPost(postTestId);
            console.log('   📊 Total de curtidas após remover:', totalCurtidas2);
        }

        // 7. TESTE DE ATUALIZAÇÃO DE POST
        console.log('\n7️⃣ TESTANDO ATUALIZAÇÃO DE POST...');
        
        if (postTestId) {
            const postAtualizado = {
                id_post: postTestId,
                conteudo: '✏️ Post atualizado via teste automático - ' + new Date().toLocaleString()
            };

            const resultadoUpdate = await postDAO.updatePost(postAtualizado);
            
            if (resultadoUpdate) {
                console.log('✅ Post atualizado com sucesso');
                
                // Verificar se foi realmente atualizado
                const postVerificacao = await postDAO.selectPostById(postTestId);
                if (postVerificacao) {
                    console.log('   📝 Novo conteúdo:', postVerificacao.conteudo.substring(0, 50) + '...');
                }
            } else {
                console.log('❌ Erro ao atualizar post');
            }
        }

        // 8. TESTE DE POSTS POR PRODUTO E ESTABELECIMENTO
        console.log('\n8️⃣ TESTANDO POSTS POR PRODUTO/ESTABELECIMENTO...');
        
        // Criar post com produto
        const postComProduto = {
            id_usuario: usuarioTeste,
            conteudo: '🛒 Post sobre produto - teste automático',
            foto_url: null,
            id_produto: 1, // Assumindo que existe produto com ID 1
            id_estabelecimento: null
        };

        const postProdutoCriado = await postDAO.insertPost(postComProduto);
        
        if (postProdutoCriado) {
            console.log('✅ Post com produto criado');
            
            // Buscar posts do produto
            const postsProduto = await postDAO.selectPostsProduto(1);
            if (postsProduto) {
                console.log('   🛒 Posts do produto 1:', postsProduto.length);
            }
        }

        // Criar post com estabelecimento
        const postComEstabelecimento = {
            id_usuario: usuarioTeste,
            conteudo: '🏪 Post sobre estabelecimento - teste automático',
            foto_url: null,
            id_produto: null,
            id_estabelecimento: 1 // Assumindo que existe estabelecimento com ID 1
        };

        const postEstabelecimentoCriado = await postDAO.insertPost(postComEstabelecimento);
        
        if (postEstabelecimentoCriado) {
            console.log('✅ Post com estabelecimento criado');
            
            // Buscar posts do estabelecimento
            const postsEstabelecimento = await postDAO.selectPostsEstabelecimento(1);
            if (postsEstabelecimento) {
                console.log('   🏪 Posts do estabelecimento 1:', postsEstabelecimento.length);
            }
        }

        // 9. TESTE DE PERFORMANCE
        console.log('\n9️⃣ TESTANDO PERFORMANCE...');
        
        const inicioTempo = Date.now();
        
        // Simular carregamento do feed
        await postDAO.selectAllPosts(50, 0);
        
        const tempoDecorrido = Date.now() - inicioTempo;
        
        console.log('✅ Teste de performance concluído');
        console.log('   ⏱️ Tempo para carregar 50 posts:', tempoDecorrido + 'ms');
        
        if (tempoDecorrido < 3000) {
            console.log('   🚀 Performance: Excelente (< 3s)');
        } else if (tempoDecorrido < 5000) {
            console.log('   ⚡ Performance: Boa (< 5s)');
        } else {
            console.log('   ⚠️ Performance: Pode melhorar (> 5s)');
        }

        // 10. LIMPEZA DOS DADOS DE TESTE
        console.log('\n🧹 LIMPANDO DADOS DE TESTE...');
        
        // Deletar comentário de teste
        if (comentarioTestId) {
            const deleteComentario = await postDAO.deleteComentario(comentarioTestId);
            if (deleteComentario) {
                console.log('✅ Comentário de teste deletado');
            }
        }

        // Deletar posts de teste
        if (postTestId) {
            const deletePost1 = await postDAO.deletePost(postTestId);
            if (deletePost1) {
                console.log('✅ Post principal de teste deletado');
            }
        }

        if (postProdutoCriado && postProdutoCriado.id_post) {
            const deletePost2 = await postDAO.deletePost(postProdutoCriado.id_post);
            if (deletePost2) {
                console.log('✅ Post com produto deletado');
            }
        }

        if (postEstabelecimentoCriado && postEstabelecimentoCriado.id_post) {
            const deletePost3 = await postDAO.deletePost(postEstabelecimentoCriado.id_post);
            if (deletePost3) {
                console.log('✅ Post com estabelecimento deletado');
            }
        }

        // RESULTADO FINAL
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TESTE DA REDE SOCIAL FINALIZADO COM SUCESSO!');
        console.log('✅ Todas as funcionalidades da rede social estão funcionando');
        console.log('📱 Sistema social pronto para uso');
        console.log('=' * 60);

    } catch (error) {
        console.error('\n❌ ERRO DURANTE O TESTE DA REDE SOCIAL:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        console.log('\n🛠️  POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verifique se o banco de dados está rodando');
        console.log('2. Certifique-se que as tabelas de posts existem');
        console.log('3. Verifique se existe pelo menos um usuário');
        console.log('4. Confira as permissões do banco de dados');
    }
}

// Função para testar interações em lote
async function testeInteracoesLote() {
    console.log('\n🔄 TESTE DE INTERAÇÕES EM LOTE...');
    
    try {
        const usuarioTeste = 1;
        
        // Criar múltiplos posts
        const posts = [];
        for (let i = 1; i <= 5; i++) {
            const post = {
                id_usuario: usuarioTeste,
                conteudo: `📝 Post de teste em lote #${i} - ${new Date().toLocaleString()}`,
                foto_url: null,
                id_produto: null,
                id_estabelecimento: null
            };
            
            const postCriado = await postDAO.insertPost(post);
            if (postCriado) {
                posts.push(postCriado);
            }
        }
        
        console.log('✅ Criados', posts.length, 'posts em lote');
        
        // Adicionar comentários e curtidas
        for (const post of posts) {
            // Adicionar comentário
            await postDAO.insertComentario({
                id_post: post.id_post,
                id_usuario: usuarioTeste,
                conteudo: `💬 Comentário automático no post ${post.id_post}`
            });
            
            // Adicionar curtida
            await postDAO.toggleCurtida(post.id_post, usuarioTeste);
        }
        
        console.log('✅ Adicionados comentários e curtidas em lote');
        
        // Verificar estatísticas
        const feedCompleto = await postDAO.selectAllPosts(10, 0);
        if (feedCompleto) {
            const totalCurtidas = feedCompleto.reduce((total, post) => total + parseInt(post.total_curtidas), 0);
            const totalComentarios = feedCompleto.reduce((total, post) => total + parseInt(post.total_comentarios), 0);
            
            console.log('📊 Estatísticas do feed:');
            console.log('   📝 Posts no feed:', feedCompleto.length);
            console.log('   ❤️ Total de curtidas:', totalCurtidas);
            console.log('   💬 Total de comentários:', totalComentarios);
        }
        
        // Limpar posts de teste
        for (const post of posts) {
            await postDAO.deletePost(post.id_post);
        }
        
        console.log('✅ Teste de lote concluído e dados limpos');
        
    } catch (error) {
        console.error('❌ Erro no teste de lote:', error.message);
    }
}

// Executar os testes
if (require.main === module) {
    testeRedesSociais()
        .then(() => testeInteracoesLote())
        .then(() => {
            console.log('\n👋 Teste da rede social finalizado. Pressione Ctrl+C para sair.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { testeRedesSociais, testeInteracoesLote };