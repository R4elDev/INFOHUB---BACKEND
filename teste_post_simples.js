/**
 * TESTE SIMPLES - POST SÓ COM CAMPOS BÁSICOS
 */

const postController = require('./controller/post/postController.js');

async function testarPostControllerCompleto() {
    try {
        console.log('🧪 TESTANDO CONTROLLER COM TODOS OS CAMPOS...\n');

        // Teste 1: Post básico (como antes)
        console.log('📝 Teste 1: Post básico');
        const postBasico = {
            id_usuario: 3,
            conteudo: "Post básico funcionando!"
        };

        let resultado1 = await postController.criarPost(postBasico, 'application/json');
        console.log('Resultado:', resultado1.status ? '✅ SUCESSO' : '❌ FALHOU');
        console.log('Status Code:', resultado1.status_code);

        // Teste 2: Post com imagem
        console.log('\n📝 Teste 2: Post com imagem');
        const postComImagem = {
            id_usuario: 3,
            conteudo: "Post com imagem funcionando!",
            imagem: "https://exemplo.com/imagem.jpg"
        };

        let resultado2 = await postController.criarPost(postComImagem, 'application/json');
        console.log('Resultado:', resultado2.status ? '✅ SUCESSO' : '❌ FALHOU');
        console.log('Status Code:', resultado2.status_code);

        // Teste 3: Post com título
        console.log('\n📝 Teste 3: Post com título');
        const postComTitulo = {
            id_usuario: 3,
            titulo: "Título do Post",
            conteudo: "Post com título funcionando!",
            imagem: "https://exemplo.com/imagem2.jpg"
        };

        let resultado3 = await postController.criarPost(postComTitulo, 'application/json');
        console.log('Resultado:', resultado3.status ? '✅ SUCESSO' : '❌ FALHOU');
        console.log('Status Code:', resultado3.status_code);

        // Teste 4: Post com id_produto NULL (deve funcionar)
        console.log('\n📝 Teste 4: Post com id_produto NULL');
        const postComProdutoNull = {
            id_usuario: 3,
            conteudo: "Post testando id_produto null",
            id_produto: null,
            imagem: "https://exemplo.com/teste.jpg"
        };

        let resultado4 = await postController.criarPost(postComProdutoNull, 'application/json');
        console.log('Resultado:', resultado4.status ? '✅ SUCESSO' : '❌ FALHOU');
        console.log('Status Code:', resultado4.status_code);
        
        if (resultado4.data) {
            console.log('Post criado:', JSON.stringify(resultado4.data, null, 2));
        }

        console.log('\n🎉 TESTES CONCLUÍDOS!');

    } catch (error) {
        console.log('\n❌ ERRO:', error.message);
    }
}

testarPostControllerCompleto();