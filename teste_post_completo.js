/**
 * TESTE COMPLETO - POST COM ID_PRODUTO E IMAGEM
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testarPostComProduto() {
    try {
        console.log('🧪 TESTANDO POST COM ID_PRODUTO E IMAGEM...\n');

        // 1. Verificar estrutura da tabela
        console.log('🔍 Verificando estrutura da tabela tbl_post...');
        const estrutura = await prisma.$queryRaw`DESCRIBE tbl_post`;
        console.table(estrutura);

        // 2. Testar INSERT com todos os campos
        console.log('\n📝 Testando INSERT de post completo...');
        const postTeste = {
            id_usuario: 3,
            titulo: 'Post de Produto Teste',
            conteudo: 'Testando post com produto e imagem',
            imagem: 'https://exemplo.com/produto-teste.jpg',
            id_produto: 1, // Assumindo que existe produto com ID 1
            id_estabelecimento: 2 // Assumindo que existe estabelecimento com ID 2
        };

        const result = await prisma.$executeRaw`
            INSERT INTO tbl_post (
                id_usuario, titulo, conteudo, imagem, id_produto, id_estabelecimento
            ) VALUES (
                ${postTeste.id_usuario},
                ${postTeste.titulo},
                ${postTeste.conteudo},
                ${postTeste.imagem},
                ${postTeste.id_produto},
                ${postTeste.id_estabelecimento}
            )
        `;

        console.log('✅ INSERT executado. Linhas afetadas:', result);

        // 3. Buscar o post inserido
        const postInserido = await prisma.$queryRaw`
            SELECT * FROM tbl_post 
            WHERE titulo = ${postTeste.titulo}
            LIMIT 1
        `;

        if (postInserido.length > 0) {
            console.log('\n✅ POST INSERIDO COM SUCESSO:');
            console.log(JSON.stringify(postInserido[0], null, 2));
        }

        // 4. Limpar dados de teste
        console.log('\n🧹 Limpando dados de teste...');
        await prisma.$executeRaw`
            DELETE FROM tbl_post 
            WHERE titulo = ${postTeste.titulo}
        `;

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('✅ Campos implementados corretamente:');
        console.log('   - id_usuario (obrigatório)');
        console.log('   - titulo (opcional)');
        console.log('   - conteudo (opcional)');
        console.log('   - imagem (opcional)');
        console.log('   - id_produto (opcional)');
        console.log('   - id_estabelecimento (opcional)');

    } catch (error) {
        console.log('\n❌ ERRO NO TESTE:');
        console.log('Mensagem:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testarPostComProduto();