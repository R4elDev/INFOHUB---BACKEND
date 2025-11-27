/**
 * TESTE DIRETO DA FUNÇÃO INSERT POST
 */

// Simular o DAO diretamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testarInsertPost() {
    try {
        console.log('🧪 TESTANDO INSERT POST DIRETAMENTE...\n');

        // Verificar se usuário existe
        const usuarios = await prisma.$queryRaw`
            SELECT id_usuario, nome FROM tbl_usuario LIMIT 3
        `;
        
        console.log('👥 USUÁRIOS DISPONÍVEIS:');
        console.table(usuarios);

        if (usuarios.length === 0) {
            console.log('❌ Nenhum usuário encontrado. Criando usuário de teste...');
            await prisma.$executeRaw`
                INSERT INTO tbl_usuario (nome, email, senha_hash, perfil)
                VALUES ('Teste User', 'teste@email.com', 'hash123', 'consumidor')
            `;
            console.log('✅ Usuário de teste criado');
        }

        // Pegar o primeiro usuário disponível
        const usuarioTeste = usuarios[0] || { id_usuario: 1 };
        
        console.log(`\n📝 TESTANDO INSERT COM USUÁRIO ID: ${usuarioTeste.id_usuario}`);

        // Dados do post de teste
        const postTeste = {
            id_usuario: usuarioTeste.id_usuario,
            titulo: null,
            conteudo: "teste 333\n\nfazendo o teste para ver se vai dar certo",
            imagem: null
        };

        console.log('📤 DADOS DO POST:');
        console.log(JSON.stringify(postTeste, null, 2));

        // Tentar inserir o post
        const result = await prisma.$executeRaw`
            INSERT INTO tbl_post (
                id_usuario, titulo, conteudo, imagem
            ) VALUES (
                ${postTeste.id_usuario},
                ${postTeste.titulo},
                ${postTeste.conteudo},
                ${postTeste.imagem}
            )
        `;

        console.log('\n✅ INSERT EXECUTADO COM SUCESSO!');
        console.log('📊 Linhas afetadas:', result);

        // Buscar o post inserido
        const postInserido = await prisma.$queryRaw`
            SELECT * FROM tbl_post 
            WHERE id_usuario = ${postTeste.id_usuario}
            ORDER BY id_post DESC 
            LIMIT 1
        `;

        console.log('\n📄 POST INSERIDO:');
        console.log(JSON.stringify(postInserido[0], null, 2));

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');

    } catch (error) {
        console.log('\n❌ ERRO NO TESTE:');
        console.log('Mensagem:', error.message);
        console.log('Código:', error.code);
        console.log('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testarInsertPost();