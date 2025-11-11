/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a COMPRAS no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT COMPRA =================================
const insertCompra = async function (compra) {
    try {
        let sql = `
            INSERT INTO tbl_compra (
                id_usuario, id_estabelecimento, valor_total, 
                status_compra, metodo_pagamento
            ) VALUES (
                ${compra.id_usuario},
                ${compra.id_estabelecimento},
                ${compra.valor_total},
                '${compra.status_compra || 'pendente'}',
                ${compra.metodo_pagamento ? `'${compra.metodo_pagamento}'` : 'NULL'}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar a compra criada
            let sqlSelect = `
                SELECT * FROM tbl_compra 
                WHERE id_usuario = ${compra.id_usuario}
                ORDER BY id_compra DESC 
                LIMIT 1
            `;
            let compraCriada = await prisma.$queryRawUnsafe(sqlSelect);
            return compraCriada[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR COMPRA:", error);
        return false;
    }
};

// ================================ INSERT ITEM COMPRA =================================
const insertItemCompra = async function (item) {
    try {
        let sql = `
            INSERT INTO tbl_itemCompra (
                id_compra, id_produto, quantidade, 
                preco_unitario, subtotal
            ) VALUES (
                ${item.id_compra},
                ${item.id_produto},
                ${item.quantidade},
                ${item.preco_unitario},
                ${item.subtotal}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO INSERIR ITEM DA COMPRA:", error);
        return false;
    }
};

// ================================ UPDATE STATUS COMPRA =================================
const updateStatusCompra = async function (id_compra, status) {
    try {
        let sql = `
            UPDATE tbl_compra 
            SET status_compra = '${status}'
            ${status === 'entregue' ? ', data_entrega = NOW()' : ''}
            WHERE id_compra = ${id_compra}
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR STATUS DA COMPRA:", error);
        return false;
    }
};

// ================================ UPDATE COMPRA =================================
const updateCompra = async function (compra) {
    try {
        let sql = `
            UPDATE tbl_compra SET
                ${compra.valor_total ? `valor_total = ${compra.valor_total},` : ''}
                ${compra.status_compra ? `status_compra = '${compra.status_compra}',` : ''}
                ${compra.metodo_pagamento ? `metodo_pagamento = '${compra.metodo_pagamento}',` : ''}
                ${compra.data_entrega ? `data_entrega = '${compra.data_entrega}',` : ''}
                id_compra = ${compra.id_compra}
            WHERE id_compra = ${compra.id_compra}
        `;

        // Remover vírgula final se existir
        sql = sql.replace(/,\s*WHERE/, ' WHERE');

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR COMPRA:", error);
        return false;
    }
};

// ================================ DELETE COMPRA =================================
const deleteCompra = async function (id_compra) {
    try {
        // Primeiro deletar itens da compra
        let sqlItems = `DELETE FROM tbl_itemCompra WHERE id_compra = ${id_compra}`;
        await prisma.$executeRawUnsafe(sqlItems);

        // Depois deletar a compra
        let sql = `DELETE FROM tbl_compra WHERE id_compra = ${id_compra}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR COMPRA:", error);
        return false;
    }
};

// ================================ SELECT COMPRA BY ID =================================
const selectCompraById = async function (id_compra) {
    try {
        let sql = `
            SELECT 
                c.*,
                u.nome as nome_usuario,
                u.email as email_usuario,
                e.nome as nome_estabelecimento,
                e.telefone as telefone_estabelecimento
            FROM tbl_compra c
            INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
            INNER JOIN tbl_estabelecimento e ON c.id_estabelecimento = e.id_estabelecimento
            WHERE c.id_compra = ${id_compra}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR COMPRA POR ID:", error);
        return false;
    }
};

// ================================ SELECT COMPRAS BY USER =================================
const selectComprasUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                c.*,
                e.nome as nome_estabelecimento,
                COUNT(ic.id_item_compra) as total_itens
            FROM tbl_compra c
            INNER JOIN tbl_estabelecimento e ON c.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_itemCompra ic ON c.id_compra = ic.id_compra
            WHERE c.id_usuario = ${id_usuario}
            GROUP BY c.id_compra
            ORDER BY c.data_compra DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR COMPRAS DO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT ITENS COMPRA =================================
const selectItensCompra = async function (id_compra) {
    try {
        let sql = `
            SELECT 
                ic.*,
                p.nome as nome_produto,
                p.descricao as descricao_produto,
                cat.nome as categoria
            FROM tbl_itemCompra ic
            INNER JOIN tbl_produto p ON ic.id_produto = p.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            WHERE ic.id_compra = ${id_compra}
            ORDER BY ic.id_item_compra
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ITENS DA COMPRA:", error);
        return false;
    }
};

// ================================ SELECT ALL COMPRAS =================================
const selectAllCompras = async function () {
    try {
        let sql = `
            SELECT 
                c.*,
                u.nome as nome_usuario,
                e.nome as nome_estabelecimento,
                COUNT(ic.id_item_compra) as total_itens
            FROM tbl_compra c
            INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
            INNER JOIN tbl_estabelecimento e ON c.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_itemCompra ic ON c.id_compra = ic.id_compra
            GROUP BY c.id_compra
            ORDER BY c.data_compra DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO LISTAR TODAS AS COMPRAS:", error);
        return false;
    }
};

// ================================ SELECT COMPRAS BY STATUS =================================
const selectComprasByStatus = async function (status) {
    try {
        let sql = `
            SELECT 
                c.*,
                u.nome as nome_usuario,
                e.nome as nome_estabelecimento,
                COUNT(ic.id_item_compra) as total_itens
            FROM tbl_compra c
            INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
            INNER JOIN tbl_estabelecimento e ON c.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_itemCompra ic ON c.id_compra = ic.id_compra
            WHERE c.status_compra = '${status}'
            GROUP BY c.id_compra
            ORDER BY c.data_compra DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR COMPRAS POR STATUS:", error);
        return false;
    }
};

// ================================ PROCESSAR COMPRA DO CARRINHO =================================
const processarCompraCarrinho = async function (dadosCompra) {
    try {
        // Iniciar transação
        await prisma.$executeRaw`START TRANSACTION`;

        // 1. Criar a compra
        const compra = await insertCompra(dadosCompra);
        if (!compra) {
            await prisma.$executeRaw`ROLLBACK`;
            return false;
        }

        // 2. Buscar itens do carrinho
        let sqlCarrinho = `
            SELECT 
                c.*,
                COALESCE(
                    pr.preco_promocional,
                    (SELECT MIN(pp.preco) 
                     FROM tbl_precoProduto pp 
                     WHERE pp.id_produto = c.id_produto)
                ) as preco_unitario
            FROM tbl_carrinho c
            LEFT JOIN tbl_promocao pr ON c.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            WHERE c.id_usuario = ${dadosCompra.id_usuario}
        `;
        let itensCarrinho = await prisma.$queryRawUnsafe(sqlCarrinho);

        // 3. Inserir cada item na compra
        for (let item of itensCarrinho) {
            const itemCompra = {
                id_compra: compra.id_compra,
                id_produto: item.id_produto,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                subtotal: item.quantidade * item.preco_unitario
            };

            const resultItem = await insertItemCompra(itemCompra);
            if (!resultItem) {
                await prisma.$executeRaw`ROLLBACK`;
                return false;
            }
        }

        // 4. Limpar carrinho do usuário
        let sqlLimpar = `DELETE FROM tbl_carrinho WHERE id_usuario = ${dadosCompra.id_usuario}`;
        await prisma.$executeRawUnsafe(sqlLimpar);

        // 5. Commit da transação
        await prisma.$executeRaw`COMMIT`;

        return compra;
    } catch (error) {
        await prisma.$executeRaw`ROLLBACK`;
        console.log("ERRO AO PROCESSAR COMPRA DO CARRINHO:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertCompra,
    insertItemCompra,
    updateStatusCompra,
    updateCompra,
    deleteCompra,
    selectCompraById,
    selectComprasUsuario,
    selectItensCompra,
    selectAllCompras,
    selectComprasByStatus,
    processarCompraCarrinho
};