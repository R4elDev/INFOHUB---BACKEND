/**
 * SCRIPT PARA ADICIONAR CAMPO IMAGEM NA TABELA PRODUTO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarCampoImagem() {
    try {
        console.log('🔄 Adicionando campo imagem na tabela tbl_produto...');
        
        await prisma.$executeRaw`
            ALTER TABLE tbl_produto 
            ADD COLUMN imagem VARCHAR(255) NULL
        `;
        
        console.log('✅ Campo imagem adicionado com sucesso na tabela tbl_produto!');
        
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('ℹ️  Campo imagem já existe na tabela tbl_produto');
        } else {
            console.log('❌ Erro ao adicionar campo:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

adicionarCampoImagem();