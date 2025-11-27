/**
 * TESTE COMPLETO - SIMULAR REQUISIÇÃO HTTP PARA POSTS
 * Este teste vai simular exatamente o que o frontend está fazendo
 */

const http = require('http');

function fazerRequisicaoPost() {
    return new Promise((resolve, reject) => {
        // Dados do payload (exatamente como o frontend envia)
        const payload = JSON.stringify({
            "id_usuario": 3,
            "conteudo": "teste 333\n\nfazendo o teste para ver se vai dar certo"
        });

        // Configuração da requisição
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/v1/infohub/posts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                // Token JWT fictício para passar pela autenticação
                'Authorization': 'Bearer token_teste'
            }
        };

        console.log('🚀 FAZENDO REQUISIÇÃO HTTP...');
        console.log('📊 Método:', options.method);
        console.log('🌐 URL:', `http://${options.hostname}:${options.port}${options.path}`);
        console.log('📤 Payload:');
        console.log(payload);
        console.log('📋 Headers:');
        console.log(JSON.stringify(options.headers, null, 2));

        const req = http.request(options, (res) => {
            let data = '';

            console.log(`\n📊 STATUS CODE: ${res.statusCode}`);
            console.log('📋 HEADERS DE RESPOSTA:');
            console.log(JSON.stringify(res.headers, null, 2));

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('\n📥 RESPOSTA COMPLETA:');
                try {
                    const response = JSON.parse(data);
                    console.log(JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 500) {
                        console.log('\n❌ ERRO 500 DETECTADO!');
                        console.log('🔧 Este é exatamente o erro que o frontend está reportando');
                    } else if (res.statusCode === 201) {
                        console.log('\n✅ POST CRIADO COM SUCESSO!');
                        console.log('🎉 O problema foi resolvido!');
                    } else if (res.statusCode === 401) {
                        console.log('\n🔐 ERRO DE AUTENTICAÇÃO');
                        console.log('ℹ️  Isso é esperado, pois estamos usando token fictício');
                    }
                    
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (error) {
                    console.log('\n📄 RESPOSTA NÃO-JSON:');
                    console.log(data);
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log('\n❌ ERRO NA REQUISIÇÃO:');
            console.log(error.message);
            reject(error);
        });

        // Enviar os dados
        req.write(payload);
        req.end();
    });
}

// Executar o teste
async function executarTeste() {
    try {
        console.log('🧪 INICIANDO TESTE DO ENDPOINT POST...\n');
        
        const resultado = await fazerRequisicaoPost();
        
        console.log('\n📊 RESULTADO FINAL:');
        console.log(`Status: ${resultado.statusCode}`);
        
        if (resultado.statusCode === 500) {
            console.log('\n🔍 ANÁLISE DO ERRO 500:');
            console.log('- O problema ainda existe no backend');
            console.log('- Verifique os logs do servidor para mais detalhes');
            console.log('- O erro está na função insertPost do DAO');
        }
        
    } catch (error) {
        console.log('\n💥 FALHA NO TESTE:', error.message);
    }
}

executarTeste();