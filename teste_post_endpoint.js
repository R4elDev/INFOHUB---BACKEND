/**
 * TESTE DO ENDPOINT DE POSTS
 * Para verificar se o erro 500 foi resolvido
 */

const axios = require('axios');

async function testarCriarPost() {
    try {
        console.log('🧪 TESTANDO CRIAÇÃO DE POST...\n');

        // Dados do teste (mesmo payload do frontend)
        const payloadTeste = {
            "id_usuario": 3,
            "conteudo": "teste 333\n\nfazendo o teste para ver se vai dar certo"
        };

        console.log('📤 PAYLOAD ENVIADO:');
        console.log(JSON.stringify(payloadTeste, null, 2));

        // Fazer a requisição
        const response = await axios.post('http://localhost:8080/v1/infohub/posts', payloadTeste, {
            headers: {
                'Content-Type': 'application/json',
                // Token JWT (você precisará colocar um token válido aqui)
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywibm9tZSI6IkpvYW8iLCJlbWFpbCI6ImpvYW9AZ21haWwuY29tIiwiaWF0IjoxNzMyNzM5NzI0LCJleHAiOjE3MzI3ODI5MjR9.dummy'
            }
        });

        console.log('\n✅ RESPOSTA RECEBIDA:');
        console.log(`📊 Status: ${response.status}`);
        console.log(`📄 Dados:`, JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('\n❌ ERRO CAPTURADO:');
        
        if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`📄 Dados do erro:`, JSON.stringify(error.response.data, null, 2));
            console.log(`📋 Headers:`, error.response.headers);
        } else if (error.request) {
            console.log('📡 Sem resposta do servidor');
            console.log(error.request);
        } else {
            console.log('🔧 Erro de configuração:', error.message);
        }
    }
}

// Executar o teste
testarCriarPost();