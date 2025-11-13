/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a estabelecimentos no BANCO DE DADOS
 * Data --> 09/10/2025
 * Autor --> GitHub Copilot
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertEstabelecimento = async function (estabelecimento) {
    try {
        let sql = `
            INSERT INTO tbl_estabelecimento (
                id_usuario, nome, cnpj, telefone
            ) VALUES (
                ${estabelecimento.id_usuario},
                '${estabelecimento.nome}',
                '${estabelecimento.cnpj}',
                ${estabelecimento.telefone ? `'${estabelecimento.telefone}'` : 'NULL'}
            );
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT * 
                FROM tbl_estabelecimento 
                WHERE cnpj = '${estabelecimento.cnpj}' 
                ORDER BY id_estabelecimento DESC 
                LIMIT 1;
            `;
            let estabelecimentoCriado = await prisma.$queryRawUnsafe(sqlSelect);
            
            // Converter BigInt para Number
            if (estabelecimentoCriado && estabelecimentoCriado.length > 0) {
                return {
                    ...estabelecimentoCriado[0],
                    id_estabelecimento: Number(estabelecimentoCriado[0].id_estabelecimento)
                };
            }
            return false;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ UPDATE =================================
const updateEstabelecimento = async function (estabelecimento) {
    try {
        let sql = `
            UPDATE tbl_estabelecimento SET
                id_usuario = ${estabelecimento.id_usuario},
                nome = '${estabelecimento.nome}',
                cnpj = '${estabelecimento.cnpj}',
                telefone = ${estabelecimento.telefone ? `'${estabelecimento.telefone}'` : 'NULL'}
            WHERE id_estabelecimento = ${estabelecimento.id_estabelecimento};
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ DELETE =================================
const deleteEstabelecimento = async function (id_estabelecimento) {
    try {
        // Verificar se existem preços de produtos ou promoções usando este estabelecimento
        let sqlCheckPrecos = `
            SELECT COUNT(*) as count 
            FROM tbl_precoProduto 
            WHERE id_estabelecimento = ${id_estabelecimento};
        `;
        
        let sqlCheckPromocoes = `
            SELECT COUNT(*) as count 
            FROM tbl_promocao 
            WHERE id_estabelecimento = ${id_estabelecimento};
        `;
        
        let [precos] = await prisma.$queryRawUnsafe(sqlCheckPrecos);
        let [promocoes] = await prisma.$queryRawUnsafe(sqlCheckPromocoes);
        
        if (Number(precos.count) > 0 || Number(promocoes.count) > 0) {
            return false; // Não pode deletar estabelecimento em uso
        }

        let sql = `
            DELETE FROM tbl_estabelecimento 
            WHERE id_estabelecimento = ${id_estabelecimento};
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

// ================================ SELECT =================================
const selectAllEstabelecimentos = async function () {
    try {
        let sql = `SELECT * FROM tbl_estabelecimento;`;

        let rsEstabelecimentos = await prisma.$queryRawUnsafe(sql);

        // Converter BigInt para Number
        if (rsEstabelecimentos && rsEstabelecimentos.length > 0) {
            return rsEstabelecimentos.map(estabelecimento => ({
                ...estabelecimento,
                id_estabelecimento: Number(estabelecimento.id_estabelecimento)
            }));
        }

        return rsEstabelecimentos;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectEstabelecimentoById = async function (id_estabelecimento) {
    try {
        let sql = `SELECT * FROM tbl_estabelecimento WHERE id_estabelecimento = ${id_estabelecimento};`;

        let rsEstabelecimento = await prisma.$queryRawUnsafe(sql);

        // Converter BigInt para Number
        if (rsEstabelecimento && rsEstabelecimento.length > 0) {
            return rsEstabelecimento.map(estabelecimento => ({
                ...estabelecimento,
                id_estabelecimento: Number(estabelecimento.id_estabelecimento)
            }));
        }

        return rsEstabelecimento;

    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    insertEstabelecimento,
    updateEstabelecimento,
    deleteEstabelecimento,
    selectAllEstabelecimentos,
    selectEstabelecimentoById
}