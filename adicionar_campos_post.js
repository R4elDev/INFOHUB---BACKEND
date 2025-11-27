/**
 * SCRIPT PARA ADICIONAR CAMPOS FALTANTES NA TABELA POST
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarCamposPost() {
    try {
        console.log('🔄 Adicionando campos id_produto e id_estabelecimento na tabela tbl_post...');
        
        // Adicionar id_produto
        await prisma.$executeRaw`
            ALTER TABLE tbl_post 
            ADD COLUMN id_produto INT NULL,
            ADD CONSTRAINT fk_post_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto)
        `;
        
        console.log('✅ Campo id_produto adicionado com FK para tbl_produto');
        
        // Adicionar id_estabelecimento  
        await prisma.$executeRaw`
            ALTER TABLE tbl_post 
            ADD COLUMN id_estabelecimento INT NULL,
            ADD CONSTRAINT fk_post_estabelecimento FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento)
        `;
        
        console.log('✅ Campo id_estabelecimento adicionado com FK para tbl_estabelecimento');
        
        console.log('\n🎉 Campos adicionados com sucesso na tabela tbl_post!');
        
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('ℹ️  Campos já existem na tabela tbl_post');
        } else {
            console.log('❌ Erro ao adicionar campos:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

adicionarCamposPost();