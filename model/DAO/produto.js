/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a produtos no BANCO DE DADOS
 * Data --> 09/10/2025
 * Autor --> ISRAEL
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertProduto = async function (produto) {
    try {
        // Iniciando uma transação para garantir a integridade dos dados
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Inserir o produto
            let sqlProduto = `
                INSERT INTO tbl_produto (
                    nome, descricao, id_categoria
                ) VALUES (
                    '${produto.nome}',
                    ${produto.descricao ? `'${produto.descricao}'` : 'NULL'},
                    ${produto.id_categoria}
                );
            `;
            
            await prisma.$executeRawUnsafe(sqlProduto);
            
            // 2. Buscar o produto recém inserido
            let sqlSelect = `
                SELECT * 
                FROM tbl_produto 
                WHERE nome = '${produto.nome}' AND id_categoria = ${produto.id_categoria}
                ORDER BY id_produto DESC 
                LIMIT 1;
            `;
            const produtoCriado = await prisma.$queryRawUnsafe(sqlSelect);
            const id = Number(produtoCriado[0].id_produto);
            
            // 3. Inserir o preço do produto
            if (produto.preco) {
                let sqlPreco = `
                    INSERT INTO tbl_precoProduto (
                        id_produto, id_estabelecimento, preco
                    ) VALUES (
                        ${id},
                        ${produto.id_estabelecimento},
                        ${produto.preco}
                    );
                `;
                await prisma.$executeRawUnsafe(sqlPreco);
            }

            // 4. Inserir a promoção se existir
            if (produto.promocao) {
                let sqlPromocao = `
                    INSERT INTO tbl_promocao (
                        id_produto, id_estabelecimento, preco_promocional,
                        data_inicio, data_fim
                    ) VALUES (
                        ${id},
                        ${produto.id_estabelecimento},
                        ${produto.promocao.preco_promocional},
                        '${produto.promocao.data_inicio}',
                        '${produto.promocao.data_fim}'
                    );
                `;
                await prisma.$executeRawUnsafe(sqlPromocao);
            }

            return id;
        });

        return result;

    } catch (error) {
        return false;
    }
}

// ================================ UPDATE =================================
const updateProduto = async function (produto) {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Atualizar dados do produto
            let sqlProduto = `
                UPDATE tbl_produto SET
                    nome = '${produto.nome}',
                    descricao = ${produto.descricao ? `'${produto.descricao}'` : 'NULL'},
                    id_categoria = ${produto.id_categoria}
                WHERE id_produto = ${produto.id_produto};
            `;
            await prisma.$executeRawUnsafe(sqlProduto);

            // 2. Atualizar preço
            if (produto.preco) {
                let sqlPreco = `
                    UPDATE tbl_precoProduto SET
                        preco = ${produto.preco}
                    WHERE id_produto = ${produto.id_produto}
                    AND id_estabelecimento = ${produto.id_estabelecimento};
                `;
                await prisma.$executeRawUnsafe(sqlPreco);
            }

            // 3. Atualizar ou inserir promoção
            if (produto.promocao) {
                // Verificar se já existe uma promoção
                const sqlCheckPromocao = `
                    SELECT id_promocao FROM tbl_promocao 
                    WHERE id_produto = ${produto.id_produto}
                    AND id_estabelecimento = ${produto.id_estabelecimento};
                `;
                const promocaoExistente = await prisma.$queryRawUnsafe(sqlCheckPromocao);

                if (promocaoExistente.length > 0) {
                    let sqlUpdatePromocao = `
                        UPDATE tbl_promocao SET
                            preco_promocional = ${produto.promocao.preco_promocional},
                            data_inicio = '${produto.promocao.data_inicio}',
                            data_fim = '${produto.promocao.data_fim}'
                        WHERE id_produto = ${produto.id_produto}
                        AND id_estabelecimento = ${produto.id_estabelecimento};
                    `;
                    await prisma.$executeRawUnsafe(sqlUpdatePromocao);
                } else {
                    let sqlInsertPromocao = `
                        INSERT INTO tbl_promocao (
                            id_produto, id_estabelecimento, preco_promocional,
                            data_inicio, data_fim
                        ) VALUES (
                            ${produto.id_produto},
                            ${produto.id_estabelecimento},
                            ${produto.promocao.preco_promocional},
                            '${produto.promocao.data_inicio}',
                            '${produto.promocao.data_fim}'
                        );
                    `;
                    await prisma.$executeRawUnsafe(sqlInsertPromocao);
                }
            }

            return true;
        });

        return result;

    } catch (error) {
        return false;
    }
}

// ================================ DELETE =================================
const deleteProduto = async function (id_produto) {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Deletar promoções associadas
            let sqlDeletePromocao = `
                DELETE FROM tbl_promocao 
                WHERE id_produto = ${id_produto};
            `;
            await prisma.$executeRawUnsafe(sqlDeletePromocao);

            // 2. Deletar preços associados
            let sqlDeletePreco = `
                DELETE FROM tbl_precoProduto 
                WHERE id_produto = ${id_produto};
            `;
            await prisma.$executeRawUnsafe(sqlDeletePreco);

            // 3. Deletar o produto
            let sqlDeleteProduto = `
                DELETE FROM tbl_produto 
                WHERE id_produto = ${id_produto};
            `;
            await prisma.$executeRawUnsafe(sqlDeleteProduto);

            return true;
        });

        return result;

    } catch (error) {
        return false;
    }
}

// ================================ SELECT =================================
const selectAllProdutos = async function () {
    try {
        let sql = `
            SELECT 
                p.id_produto, p.nome, p.descricao, p.id_categoria,
                c.nome as categoria,
                pp.preco, pp.id_estabelecimento,
                pr.preco_promocional, pr.data_inicio, pr.data_fim
            FROM tbl_produto p
            LEFT JOIN tbl_categoria c ON c.id_categoria = p.id_categoria
            LEFT JOIN tbl_precoProduto pp ON pp.id_produto = p.id_produto
            LEFT JOIN tbl_promocao pr ON pr.id_produto = p.id_produto
                AND pr.id_estabelecimento = pp.id_estabelecimento
                AND CURRENT_DATE BETWEEN pr.data_inicio AND pr.data_fim;
        `;

        let rsProdutos = await prisma.$queryRawUnsafe(sql);

        return rsProdutos;

    } catch (error) {
        return false;
    }
}

const selectProdutoById = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                p.id_produto, p.nome, p.descricao, p.id_categoria,
                c.nome as categoria,
                pp.preco, pp.id_estabelecimento,
                pr.preco_promocional, pr.data_inicio, pr.data_fim
            FROM tbl_produto p
            LEFT JOIN tbl_categoria c ON c.id_categoria = p.id_categoria
            LEFT JOIN tbl_precoProduto pp ON pp.id_produto = p.id_produto
            LEFT JOIN tbl_promocao pr ON pr.id_produto = p.id_produto
                AND pr.id_estabelecimento = pp.id_estabelecimento
                AND CURRENT_DATE BETWEEN pr.data_inicio AND pr.data_fim
            WHERE p.id_produto = ${id_produto};
        `;

        let rsProduto = await prisma.$queryRawUnsafe(sql);

        return rsProduto;

    } catch (error) {
        return false;
    }
}

module.exports = {
    insertProduto,
    updateProduto,
    deleteProduto,
    selectAllProdutos,
    selectProdutoById
}