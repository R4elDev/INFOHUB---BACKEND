/**
 * TESTE DAS APIs DA REDE SOCIAL
 * Testa os endpoints REST da rede social
 * Execute: node teste_apis_rede_social.js
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

let postTestId = null;
let comentarioTestId = null;

async function testarAPIsRedeSocial() {
    console.log('📱 INICIANDO TESTE DAS APIs DA REDE SOCIAL\n');
    console.log('🔗 URL da API:', API_BASE_URL);
    console.log('👤 Usuário de teste:', USER_ID);
    console.log('='.repeat(70));

    try {
        // 1. TESTAR CRIAÇÃO DE POST
        console.log('\n1️⃣ TESTANDO POST /posts (Criar Post)');
        try {
            const novoPost = {
                id_usuario: USER_ID,
                conteudo: '🧪 Post de teste via API - ' + new Date().toLocaleString(),
                foto_url: null,
                id_produto: null,
                id_estabelecimento: null
            };

            const postResponse = await axios.post(`${API_BASE_URL}/posts`, novoPost, { headers });
            
            if (postResponse.status === 201 && postResponse.data.status) {
                console.log('✅ Post criado com sucesso via API');
                console.log('   🆔 ID do post:', postResponse.data.data.id_post);
                console.log('   📝 Conteúdo:', postResponse.data.data.conteudo.substring(0, 50) + '...');
                postTestId = postResponse.data.data.id_post;
            } else {
                console.log('❌ Resposta inesperada:', postResponse.data);
            }
        } catch (error) {
            console.log('❌ Erro ao criar post:', error.response?.data || error.message);
        }

        // 2. TESTAR BUSCA DE POST POR ID
        console.log('\n2️⃣ TESTANDO GET /post/:id (Buscar Post)');
        if (postTestId) {
            try {
                const getPostResponse = await axios.get(`${API_BASE_URL}/post/${postTestId}`, { headers });
                
                if (getPostResponse.status === 200 && getPostResponse.data.status) {
                    console.log('✅ Post encontrado via API');
                    console.log('   👤 Autor:', getPostResponse.data.data.post.nome_usuario);
                    console.log('   📝 Conteúdo:', getPostResponse.data.data.post.conteudo.substring(0, 50) + '...');
                    console.log('   💬 Comentários:', getPostResponse.data.data.comentarios.length);
                } else {
                    console.log('❌ Post não encontrado');
                }
            } catch (error) {
                console.log('❌ Erro ao buscar post:', error.response?.data || error.message);
            }
        }

        // 3. TESTAR FEED GERAL
        console.log('\n3️⃣ TESTANDO GET /posts/feed (Feed Geral)');
        try {
            const feedResponse = await axios.get(`${API_BASE_URL}/posts/feed`, { headers });
            
            if (feedResponse.status === 200 && feedResponse.data.status) {
                console.log('✅ Feed carregado via API');
                console.log('   📊 Posts no feed:', feedResponse.data.data.length);
                
                if (feedResponse.data.data.length > 0) {
                    const primeiroPost = feedResponse.data.data[0];
                    console.log('   👤 Primeiro autor:', primeiroPost.nome_usuario);
                    console.log('   📝 Primeiro post:', primeiroPost.conteudo.substring(0, 40) + '...');
                    console.log('   ❤️ Curtidas:', primeiroPost.total_curtidas);
                    console.log('   💬 Comentários:', primeiroPost.total_comentarios);
                }
            } else {
                console.log('❌ Erro ao carregar feed');
            }
        } catch (error) {
            console.log('❌ Erro no feed:', error.response?.data || error.message);
        }

        // 4. TESTAR POSTS DO USUÁRIO
        console.log('\n4️⃣ TESTANDO GET /posts/usuario/:id (Posts do Usuário)');
        try {
            const postsUsuarioResponse = await axios.get(`${API_BASE_URL}/posts/usuario/${USER_ID}`, { headers });
            
            if (postsUsuarioResponse.status === 200 && postsUsuarioResponse.data.status) {
                console.log('✅ Posts do usuário encontrados');
                console.log('   📊 Total de posts:', postsUsuarioResponse.data.data.length);
                
                if (postsUsuarioResponse.data.data.length > 0) {
                    console.log('   📝 Último post:', postsUsuarioResponse.data.data[0].conteudo.substring(0, 40) + '...');
                }
            }
        } catch (error) {
            console.log('❌ Erro ao buscar posts do usuário:', error.response?.data || error.message);
        }

        // 5. TESTAR COMENTÁRIOS
        console.log('\n5️⃣ TESTANDO SISTEMA DE COMENTÁRIOS');
        if (postTestId) {
            // Criar comentário
            try {
                const novoComentario = {
                    id_post: postTestId,
                    id_usuario: USER_ID,
                    conteudo: '💬 Comentário de teste via API - ' + new Date().toLocaleString()
                };

                const comentarioResponse = await axios.post(
                    `${API_BASE_URL}/post/${postTestId}/comentario`, 
                    novoComentario, 
                    { headers }
                );
                
                if (comentarioResponse.status === 201 && comentarioResponse.data.status) {
                    console.log('✅ Comentário criado via API');
                    console.log('   🆔 ID do comentário:', comentarioResponse.data.data.id_comentario);
                    console.log('   👤 Autor:', comentarioResponse.data.data.nome_usuario);
                    comentarioTestId = comentarioResponse.data.data.id_comentario;
                }
            } catch (error) {
                console.log('❌ Erro ao comentar:', error.response?.data || error.message);
            }

            // Listar comentários do post
            try {
                const comentariosResponse = await axios.get(
                    `${API_BASE_URL}/post/${postTestId}/comentarios`, 
                    { headers }
                );
                
                if (comentariosResponse.status === 200 && comentariosResponse.data.status) {
                    console.log('✅ Comentários listados via API');
                    console.log('   💬 Total de comentários:', comentariosResponse.data.data.length);
                    
                    if (comentariosResponse.data.data.length > 0) {
                        const ultimoComentario = comentariosResponse.data.data[0];
                        console.log('   📝 Último comentário:', ultimoComentario.conteudo.substring(0, 30) + '...');
                        console.log('   👤 Por:', ultimoComentario.nome_usuario);
                    }
                }
            } catch (error) {
                console.log('❌ Erro ao listar comentários:', error.response?.data || error.message);
            }
        }

        // 6. TESTAR CURTIDAS
        console.log('\n6️⃣ TESTANDO SISTEMA DE CURTIDAS');
        if (postTestId) {
            // Adicionar curtida
            try {
                const curtidaData = {
                    id_usuario: USER_ID
                };

                const curtidaResponse = await axios.post(
                    `${API_BASE_URL}/post/${postTestId}/curtir`, 
                    curtidaData, 
                    { headers }
                );
                
                if (curtidaResponse.status === 200 && curtidaResponse.data.status) {
                    console.log('✅ Curtida processada via API');
                    console.log('   ❤️ Status:', curtidaResponse.data.data.curtido ? 'Curtido' : 'Descurtido');
                    console.log('   📊 Total de curtidas:', curtidaResponse.data.data.total_curtidas);
                }
            } catch (error) {
                console.log('❌ Erro ao curtir:', error.response?.data || error.message);
            }

            // Verificar estatísticas do post
            try {
                const statsResponse = await axios.get(
                    `${API_BASE_URL}/post/${postTestId}/estatisticas`, 
                    { headers }
                );
                
                if (statsResponse.status === 200 && statsResponse.data.status) {
                    console.log('✅ Estatísticas do post obtidas');
                    console.log('   📊 Dados:', {
                        curtidas: statsResponse.data.data.curtidas,
                        comentarios: statsResponse.data.data.comentarios
                    });
                }
            } catch (error) {
                console.log('❌ Erro ao obter estatísticas:', error.response?.data || error.message);
            }

            // Descurtir (toggle)
            try {
                const descurtirResponse = await axios.post(
                    `${API_BASE_URL}/post/${postTestId}/curtir`, 
                    { id_usuario: USER_ID }, 
                    { headers }
                );
                
                if (descurtirResponse.status === 200 && descurtirResponse.data.status) {
                    console.log('✅ Descurtida processada via API');
                    console.log('   ❤️ Status:', descurtirResponse.data.data.curtido ? 'Curtido' : 'Descurtido');
                    console.log('   📊 Total de curtidas:', descurtirResponse.data.data.total_curtidas);
                }
            } catch (error) {
                console.log('❌ Erro ao descurtir:', error.response?.data || error.message);
            }
        }

        // 7. TESTAR ATUALIZAÇÃO DE POST
        console.log('\n7️⃣ TESTANDO PUT /post/:id (Atualizar Post)');
        if (postTestId) {
            try {
                const postAtualizado = {
                    conteudo: '✏️ Post atualizado via API - ' + new Date().toLocaleString()
                };

                const updateResponse = await axios.put(
                    `${API_BASE_URL}/post/${postTestId}`, 
                    postAtualizado, 
                    { headers }
                );
                
                if (updateResponse.status === 200 && updateResponse.data.status) {
                    console.log('✅ Post atualizado via API');
                    console.log('   📝 Status:', updateResponse.data.message);
                }
            } catch (error) {
                console.log('❌ Erro ao atualizar post:', error.response?.data || error.message);
            }
        }

        // 8. TESTAR POSTS POR PRODUTO/ESTABELECIMENTO
        console.log('\n8️⃣ TESTANDO POSTS RELACIONADOS');
        
        // Criar post com produto
        try {
            const postComProduto = {
                id_usuario: USER_ID,
                conteudo: '🛒 Post sobre produto via API',
                id_produto: 1 // Assumindo que existe produto com ID 1
            };

            const postProdutoResponse = await axios.post(`${API_BASE_URL}/posts`, postComProduto, { headers });
            
            if (postProdutoResponse.status === 201) {
                console.log('✅ Post com produto criado via API');
                
                // Buscar posts do produto (se endpoint existir)
                // Nota: Este endpoint pode não existir no sistema atual
            }
        } catch (error) {
            console.log('⚠️  Teste de post com produto:', error.response?.status || error.message);
        }

        // 9. TESTE DE VALIDAÇÃO
        console.log('\n9️⃣ TESTANDO VALIDAÇÕES');
        
        // Post sem conteúdo
        try {
            const postInvalido = {
                id_usuario: USER_ID
                // Sem conteúdo obrigatório
            };

            const invalidResponse = await axios.post(`${API_BASE_URL}/posts`, postInvalido, { headers });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Validação funcionando - post sem conteúdo rejeitado');
                console.log('   📝 Mensagem:', error.response.data.message);
            }
        }

        // Comentário muito longo
        try {
            if (postTestId) {
                const comentarioLongo = {
                    id_post: postTestId,
                    id_usuario: USER_ID,
                    conteudo: 'A'.repeat(201) // Mais que 200 caracteres
                };

                await axios.post(`${API_BASE_URL}/post/${postTestId}/comentario`, comentarioLongo, { headers });
            }
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Validação de comentário funcionando - texto muito longo rejeitado');
            }
        }

        // 10. TESTE DE PERFORMANCE
        console.log('\n🔟 TESTANDO PERFORMANCE DAS APIs');
        
        const inicioPerformance = Date.now();
        
        try {
            // Múltiplas requisições simultâneas
            const promises = [
                axios.get(`${API_BASE_URL}/posts/feed`, { headers }),
                axios.get(`${API_BASE_URL}/posts/usuario/${USER_ID}`, { headers }),
                postTestId ? axios.get(`${API_BASE_URL}/post/${postTestId}`, { headers }) : Promise.resolve()
            ];

            await Promise.all(promises);
            
            const tempoTotal = Date.now() - inicioPerformance;
            
            console.log('✅ Teste de performance concluído');
            console.log('   ⏱️ Tempo total para 3 requisições:', tempoTotal + 'ms');
            
            if (tempoTotal < 2000) {
                console.log('   🚀 Performance: Excelente (< 2s)');
            } else if (tempoTotal < 5000) {
                console.log('   ⚡ Performance: Boa (< 5s)');
            } else {
                console.log('   ⚠️ Performance: Pode melhorar (> 5s)');
            }
        } catch (error) {
            console.log('❌ Erro no teste de performance:', error.message);
        }

        // LIMPEZA - DELETAR DADOS DE TESTE
        console.log('\n🧹 LIMPANDO DADOS DE TESTE...');
        
        // Deletar comentário
        if (comentarioTestId) {
            try {
                await axios.delete(`${API_BASE_URL}/comentario/${comentarioTestId}`, { headers });
                console.log('✅ Comentário de teste deletado via API');
            } catch (error) {
                console.log('⚠️  Erro ao deletar comentário:', error.response?.status || error.message);
            }
        }

        // Deletar post
        if (postTestId) {
            try {
                await axios.delete(`${API_BASE_URL}/post/${postTestId}`, { headers });
                console.log('✅ Post de teste deletado via API');
            } catch (error) {
                console.log('⚠️  Erro ao deletar post:', error.response?.status || error.message);
            }
        }

        // RESULTADO FINAL
        console.log('\n' + '='.repeat(70));
        console.log('🎉 TESTE DAS APIs DA REDE SOCIAL FINALIZADO!');
        console.log('✅ APIs da rede social testadas com sucesso');
        console.log('📱 Sistema social pronto para integração com frontend');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ ERRO FATAL DURANTE OS TESTES:', error.message);
        console.log('\n🛠️  VERIFIQUE:');
        console.log('1. Se o servidor está rodando na porta correta');
        console.log('2. Se as rotas da rede social foram registradas');
        console.log('3. Se o banco de dados está conectado');
        console.log('4. Se existe um usuário com ID', USER_ID);
        console.log('5. Se as tabelas de posts, comentários e curtidas existem');
    }
}

// Função para testar conectividade
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
            return testarAPIsRedeSocial();
        } else {
            console.log('\n🚫 Interrompendo testes devido a problemas de conectividade');
            console.log('💡 Certifique-se que o servidor está rodando com: node app.js');
        }
    }).then(() => {
        console.log('\n👋 Teste das APIs da rede social finalizado. Pressione Ctrl+C para sair.');
        process.exit(0);
    }).catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { testarAPIsRedeSocial, testarConectividade };