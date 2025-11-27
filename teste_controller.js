/**
 * TESTE SIMPLES SEM AUTENTICAÇÃO
 * Vamos testar direto a função do controller
 */

// Importar o controller diretamente
const postController = require('./controller/post/postController.js');

async function testarControllerDiretamente() {
    try {
        console.log('🧪 TESTANDO CONTROLLER DIRETAMENTE...\n');

        // Dados de teste (exatamente como o frontend envia)
        const dadosPost = {
            id_usuario: 3,
            conteudo: "teste 333\n\nfazendo o teste para ver se vai dar certo"
        };

        console.log('📤 DADOS DE ENTRADA:');
        console.log(JSON.stringify(dadosPost, null, 2));

        // Chamar a função do controller diretamente
        const resultado = await postController.criarPost(dadosPost, 'application/json');

        console.log('\n📥 RESULTADO DO CONTROLLER:');
        console.log(JSON.stringify(resultado, null, 2));

        if (resultado.status === true && resultado.status_code === 201) {
            console.log('\n✅ SUCESSO! POST CRIADO PELO CONTROLLER');
            console.log('🎉 O problema do backend foi resolvido!');
            console.log('🔧 O erro 500 não deve mais ocorrer');
        } else if (resultado.status === false && resultado.status_code === 500) {
            console.log('\n❌ ERRO 500 AINDA PERSISTE NO CONTROLLER');
            console.log('🔍 Verifique o erro:', resultado.message);
        }

        return resultado;
        
    } catch (error) {
        console.log('\n💥 ERRO CAPTURADO:');
        console.log('Mensagem:', error.message);
        console.log('Stack:', error.stack);
        return {
            status: false,
            status_code: 500,
            message: `Erro interno: ${error.message}`
        };
    }
}

// Executar teste
testarControllerDiretamente();