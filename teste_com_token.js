/**
 * TESTE COM TOKEN JWT VÁLIDO
 * Gera um token JWT válido para testar o endpoint
 */

const jwt = require('jsonwebtoken');
const http = require('http');

async function gerarTokenValido() {
    // JWT_SECRET do .env (você pode precisar ajustar este valor)
    const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';
    
    // Payload do token (dados do usuário)
    const payload = {
        id: 3,
        nome: 'Israel Junior',
        email: 'raraeldev@gmail.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
    };
    
    return jwt.sign(payload, JWT_SECRET);
}

function fazerRequisicaoComToken(token) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            "id_usuario": 3,
            "conteudo": "teste 333\n\nfazendo o teste para ver se vai dar certo"
        });

        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/v1/infohub/posts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Bearer ${token}`
            }
        };

        console.log('🚀 FAZENDO REQUISIÇÃO COM TOKEN VÁLIDO...');
        console.log('🔐 Token JWT gerado:', token.substring(0, 50) + '...');

        const req = http.request(options, (res) => {
            let data = '';

            console.log(`\n📊 STATUS CODE: ${res.statusCode}`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('\n📥 RESPOSTA:');
                try {
                    const response = JSON.parse(data);
                    console.log(JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 500) {
                        console.log('\n❌ AINDA TEMOS ERRO 500!');
                        console.log('🔧 O problema está no código do backend, não na autenticação');
                    } else if (res.statusCode === 201) {
                        console.log('\n✅ POST CRIADO COM SUCESSO!');
                        console.log('🎉 O problema foi completamente resolvido!');
                    } else if (res.statusCode === 401) {
                        console.log('\n🔐 PROBLEMA DE AUTENTICAÇÃO');
                        console.log('ℹ️  Verifique a chave JWT_SECRET no .env');
                    }
                    
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (error) {
                    console.log('\n📄 RESPOSTA NÃO-JSON:', data);
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log('\n❌ ERRO:', error.message);
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

async function executarTesteFinal() {
    try {
        console.log('🧪 TESTE FINAL - COM TOKEN JWT VÁLIDO\n');
        
        // Gerar token válido
        const token = gerarTokenValido();
        
        // Fazer requisição
        const resultado = await fazerRequisicaoComToken(token);
        
        console.log('\n📊 ANÁLISE FINAL:');
        if (resultado.statusCode === 201) {
            console.log('✅ PROBLEMA RESOLVIDO COMPLETAMENTE!');
            console.log('✅ O backend está funcionando corretamente');
            console.log('✅ O frontend pode fazer requests normalmente');
        } else if (resultado.statusCode === 500) {
            console.log('❌ AINDA EXISTE UM PROBLEMA NO BACKEND');
            console.log('🔍 Verifique os logs do servidor para mais detalhes'); 
        }
        
    } catch (error) {
        console.log('💥 ERRO NO TESTE:', error.message);
    }
}

executarTesteFinal();