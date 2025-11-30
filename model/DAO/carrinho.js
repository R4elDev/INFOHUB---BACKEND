/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente ao CARRINHO no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Converter BigInt para Number (problema comum com Prisma + MySQL)
BigInt.prototype.toJSON = function() {
    return Number(this);
};

// ================================ INSERT =================================
const insertItemCarrinho = async function (item) {
    try {
        // Verificar se item já existe no carrinho
        let sqlCheck = `
            SELECT * FROM tbl_carrinho 
            WHERE id_usuario = ${item.id_usuario} 
            AND id_produto = ${item.id_produto}
        `;
        let existingItem = await prisma.$queryRawUnsafe(sqlCheck);

        if (existingItem.length > 0) {
            // Se já existe, atualizar quantidade
            let sqlUpdate = `
                UPDATE tbl_carrinho 
                SET quantidade = quantidade + ${item.quantidade || 1}
                WHERE id_usuario = ${item.id_usuario} 
                AND id_produto = ${item.id_produto}
            `;
            let result = await prisma.$executeRawUnsafe(sqlUpdate);
            
            if (result) {
                return await selectItemCarrinho(item.id_usuario, item.id_produto);
            }
        } else {
            // Se não existe, inserir novo item
            let sql = `
                INSERT INTO tbl_carrinho (
                    id_usuario, id_produto, quantidade
                ) VALUES (
                    ${item.id_usuario},
                    ${item.id_produto},
                    ${item.quantidade || 1}
                )
            `;

            let result = await prisma.$executeRawUnsafe(sql);

            if (result) {
                return await selectItemCarrinho(item.id_usuario, item.id_produto);
            }
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR ITEM NO CARRINHO:", error);
        return false;
    }
};

// ================================ UPDATE =================================
const updateItemCarrinho = async function (item) {
    try {
        let sql = `
            UPDATE tbl_carrinho SET
                quantidade = ${item.quantidade}
            WHERE id_usuario = ${item.id_usuario} 
            AND id_produto = ${item.id_produto}
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR ITEM DO CARRINHO:", error);
        return false;
    }
};

// ================================ DELETE =================================
const deleteItemCarrinho = async function (id_usuario, id_produto) {
    try {
        let sql = `
            DELETE FROM tbl_carrinho 
            WHERE id_usuario = ${id_usuario} 
            AND id_produto = ${id_produto}
        `;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR ITEM DO CARRINHO:", error);
        return false;
    }
};

// ================================ DELETE ALL FROM USER =================================
const clearCarrinhoUsuario = async function (id_usuario) {
    try {
        let sql = `DELETE FROM tbl_carrinho WHERE id_usuario = ${id_usuario}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO LIMPAR CARRINHO DO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT BY USER =================================
const selectCarrinhoUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                c.id_carrinho,
                c.id_usuario,
                c.id_produto,
                c.quantidade,
                c.data_adicionado,
                p.nome as nome_produto,
                p.descricao,
                p.imagem,
                cat.nome as categoria,
                -- Pegar o menor preço atual do produto
                CAST((SELECT MIN(pp.preco) 
                 FROM tbl_precoProduto pp 
                 WHERE pp.id_produto = c.id_produto) AS DECIMAL(10,2)) as preco_atual,
                -- Pegar promoção ativa se existir
                CAST(pr.preco_promocional AS DECIMAL(10,2)) as preco_promocional,
                pr.data_fim as promocao_valida_ate
            FROM tbl_carrinho c
            INNER JOIN tbl_produto p ON c.id_produto = p.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            WHERE c.id_usuario = ${id_usuario}
            ORDER BY c.data_adicionado DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR CARRINHO DO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT ITEM ESPECÍFICO =================================
const selectItemCarrinho = async function (id_usuario, id_produto) {
    try {
        let sql = `
            SELECT 
                c.*,
                p.nome as nome_produto,
                p.descricao,
                p.imagem
            FROM tbl_carrinho c
            INNER JOIN tbl_produto p ON c.id_produto = p.id_produto
            WHERE c.id_usuario = ${id_usuario} 
            AND c.id_produto = ${id_produto}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ITEM DO CARRINHO:", error);
        return false;
    }
};

// ================================ COUNT ITEMS =================================
const countItensCarrinho = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                CAST(COUNT(*) AS UNSIGNED) as total_itens,
                CAST(COALESCE(SUM(quantidade), 0) AS UNSIGNED) as total_produtos
            FROM tbl_carrinho 
            WHERE id_usuario = ${id_usuario}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? {
            total_itens: Number(result[0].total_itens),
            total_produtos: Number(result[0].total_produtos)
        } : { total_itens: 0, total_produtos: 0 };
    } catch (error) {
        console.log("ERRO AO CONTAR ITENS DO CARRINHO:", error);
        return { total_itens: 0, total_produtos: 0 };
    }
};

// ================================ CALCULAR TOTAL CARRINHO =================================
const calcularTotalCarrinho = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                CAST(SUM(
                    c.quantidade * 
                    COALESCE(
                        pr.preco_promocional,
                        (SELECT MIN(pp.preco) 
                         FROM tbl_precoProduto pp 
                         WHERE pp.id_produto = c.id_produto)
                    )
                ) AS DECIMAL(10,2)) as valor_total
            FROM tbl_carrinho c
            INNER JOIN tbl_produto p ON c.id_produto = p.id_produto
            LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            WHERE c.id_usuario = ${id_usuario}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? Number(result[0].valor_total || 0) : 0;
    } catch (error) {
        console.log("ERRO AO CALCULAR TOTAL DO CARRINHO:", error);
        return 0;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertItemCarrinho,
    updateItemCarrinho,
    deleteItemCarrinho,
    clearCarrinhoUsuario,
    selectCarrinhoUsuario,
    selectItemCarrinho,
    countItensCarrinho,
    calcularTotalCarrinho
};