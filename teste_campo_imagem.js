/**
 * TESTE DO CAMPO IMAGEM NO PRODUTO
 * Verificar se o campo foi implementado corretamente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testarCampoImagem() {
    try {
        console.log('🧪 TESTANDO CAMPO IMAGEM EM PRODUTOS...\n');

        // 1. Verificar estrutura da tabela
        console.log('🔍 Verificando estrutura da tabela tbl_produto...');
        const estrutura = await prisma.$queryRaw`DESCRIBE tbl_produto`;
        console.table(estrutura);

        // 2. Testar INSERT com imagem
        console.log('\n📝 Testando INSERT de produto com imagem...');
        const produtoTeste = {
            nome: 'Produto Teste com Imagem',
            descricao: 'Produto para testar o campo imagem',
            id_categoria: 1,
            imagem: 'https://exemplo.com/produto-teste.jpg'
        };

        const resultInsert = await prisma.$executeRaw`
            INSERT INTO tbl_produto (nome, descricao, id_categoria, imagem)
            VALUES (${produtoTeste.nome}, ${produtoTeste.descricao}, ${produtoTeste.id_categoria}, ${produtoTeste.imagem})
        `;

        console.log('✅ INSERT executado. Linhas afetadas:', resultInsert);

        // 3. Testar SELECT com imagem
        console.log('\n📄 Buscando produto inserido...');
        const produtoInserido = await prisma.$queryRaw`
            SELECT * FROM tbl_produto 
            WHERE nome = ${produtoTeste.nome}
            LIMIT 1
        `;

        if (produtoInserido.length > 0) {
            console.log('✅ Produto encontrado com imagem:');
            console.log(JSON.stringify(produtoInserido[0], null, 2));
        }

        // 4. Testar UPDATE da imagem
        console.log('\n🔄 Testando UPDATE da imagem...');
        const novaImagem = 'https://exemplo.com/produto-atualizado.jpg';
        
        const resultUpdate = await prisma.$executeRaw`
            UPDATE tbl_produto 
            SET imagem = ${novaImagem}
            WHERE nome = ${produtoTeste.nome}
        `;

        console.log('✅ UPDATE executado. Linhas afetadas:', resultUpdate);

        // 5. Testar SELECT após UPDATE
        const produtoAtualizado = await prisma.$queryRaw`
            SELECT * FROM tbl_produto 
            WHERE nome = ${produtoTeste.nome}
            LIMIT 1
        `;

        if (produtoAtualizado.length > 0) {
            console.log('✅ Produto após UPDATE:');
            console.log(JSON.stringify(produtoAtualizado[0], null, 2));
        }

        // 6. Limpar dados de teste
        console.log('\n🧹 Limpando dados de teste...');
        await prisma.$executeRaw`
            DELETE FROM tbl_produto 
            WHERE nome = ${produtoTeste.nome}
        `;

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('✅ Campo imagem foi implementado corretamente em:');
        console.log('   - Estrutura da tabela');
        console.log('   - INSERT de produtos');
        console.log('   - UPDATE de produtos');
        console.log('   - SELECT de produtos');

    } catch (error) {
        console.log('\n❌ ERRO NO TESTE:');
        console.log('Mensagem:', error.message);
        console.log('Código:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

testarCampoImagem();