/**
 * VERIFICAR SE O USUÁRIO ID=3 EXISTE NO BANCO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarUsuario() {
    try {
        console.log('🔍 VERIFICANDO SE USUÁRIO ID=3 EXISTE...\n');

        const usuario = await prisma.$queryRaw`
            SELECT id_usuario, nome, email FROM tbl_usuario WHERE id_usuario = 3
        `;

        if (usuario && usuario.length > 0) {
            console.log('✅ USUÁRIO ENCONTRADO:');
            console.log(JSON.stringify(usuario[0], null, 2));
        } else {
            console.log('❌ USUÁRIO ID=3 NÃO ENCONTRADO');
            console.log('📝 Criando usuário de teste...');

            // Criar usuário de teste
            await prisma.$executeRaw`
                INSERT INTO tbl_usuario (id_usuario, nome, email, senha_hash, perfil)
                VALUES (3, 'Usuário Teste', 'teste@email.com', 'hash123', 'consumidor')
            `;

            console.log('✅ Usuário de teste criado com ID=3');
        }

        // Verificar estrutura da tabela posts
        console.log('\n🔍 VERIFICANDO ESTRUTURA DA TABELA tbl_post...');
        const estrutura = await prisma.$queryRaw`DESCRIBE tbl_post`;
        console.log('📋 ESTRUTURA DA TABELA:');
        console.table(estrutura);

    } catch (error) {
        console.log('❌ ERRO:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verificarUsuario();