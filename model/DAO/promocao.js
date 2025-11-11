/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a PROMOÇÕES no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT PROMOCAO =================================
const insertPromocao = async function (promocao) {
    try {
        let sql = `
            INSERT INTO tbl_promocao (
                id_produto, id_estabelecimento, preco_promocional,
                data_inicio, data_fim, descricao_promocao
            ) VALUES (
                ${promocao.id_produto},
                ${promocao.id_estabelecimento},
                ${promocao.preco_promocional},
                '${promocao.data_inicio}',
                '${promocao.data_fim}',
                ${promocao.descricao_promocao ? `'${promocao.descricao_promocao}'` : 'NULL'}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar a promoção criada
            let sqlSelect = `
                SELECT * FROM tbl_promocao 
                WHERE id_produto = ${promocao.id_produto} 
                  AND id_estabelecimento = ${promocao.id_estabelecimento}
                ORDER BY id_promocao DESC 
                LIMIT 1
            `;
            let promocaoCriada = await prisma.$queryRawUnsafe(sqlSelect);
            return promocaoCriada[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR PROMOÇÃO:", error);
        return false;
    }
};

// ================================ UPDATE PROMOCAO =================================
const updatePromocao = async function (promocao) {
    try {
        let sql = `
            UPDATE tbl_promocao SET
                ${promocao.preco_promocional ? `preco_promocional = ${promocao.preco_promocional},` : ''}
                ${promocao.data_inicio ? `data_inicio = '${promocao.data_inicio}',` : ''}
                ${promocao.data_fim ? `data_fim = '${promocao.data_fim}',` : ''}
                ${promocao.descricao_promocao ? `descricao_promocao = '${promocao.descricao_promocao}',` : ''}
                id_promocao = ${promocao.id_promocao}
            WHERE id_promocao = ${promocao.id_promocao}
        `;

        // Remover vírgula final se existir
        sql = sql.replace(/,\s*WHERE/, ' WHERE');

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR PROMOÇÃO:", error);
        return false;
    }
};

// ================================ DELETE PROMOCAO =================================
const deletePromocao = async function (id_promocao) {
    try {
        let sql = `DELETE FROM tbl_promocao WHERE id_promocao = ${id_promocao}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR PROMOÇÃO:", error);
        return false;
    }
};

// ================================ SELECT PROMOCAO BY ID =================================
const selectPromocaoById = async function (id_promocao) {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                p.descricao as descricao_produto,
                e.nome as nome_estabelecimento,
                cat.nome as categoria
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            WHERE pr.id_promocao = ${id_promocao}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÃO POR ID:", error);
        return false;
    }
};

// ================================ SELECT PROMOCOES ATIVAS =================================
const selectPromocoesAtivas = async function () {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                p.descricao as descricao_produto,
                e.nome as nome_estabelecimento,
                cat.nome as categoria,
                pp.preco as preco_original,
                (pp.preco - pr.preco_promocional) as desconto,
                ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 2) as percentual_desconto
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
            WHERE pr.data_inicio <= CURDATE() 
              AND pr.data_fim >= CURDATE()
            ORDER BY percentual_desconto DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES ATIVAS:", error);
        return false;
    }
};

// ================================ SELECT PROMOCOES BY PRODUTO =================================
const selectPromocoesProduto = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                e.nome as nome_estabelecimento,
                pp.preco as preco_original,
                (pp.preco - pr.preco_promocional) as desconto,
                ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 2) as percentual_desconto
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
            WHERE pr.id_produto = ${id_produto}
              AND pr.data_inicio <= CURDATE() 
              AND pr.data_fim >= CURDATE()
            ORDER BY pr.preco_promocional ASC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES DO PRODUTO:", error);
        return false;
    }
};

// ================================ SELECT PROMOCOES BY ESTABELECIMENTO =================================
const selectPromocoesEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                p.descricao as descricao_produto,
                cat.nome as categoria,
                pp.preco as preco_original,
                (pp.preco - pr.preco_promocional) as desconto,
                ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 2) as percentual_desconto
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
            WHERE pr.id_estabelecimento = ${id_estabelecimento}
              AND pr.data_inicio <= CURDATE() 
              AND pr.data_fim >= CURDATE()
            ORDER BY percentual_desconto DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ SELECT MELHORES PROMOCOES =================================
const selectMelhoresPromocoes = async function (limit = 10) {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                p.descricao as descricao_produto,
                e.nome as nome_estabelecimento,
                cat.nome as categoria,
                pp.preco as preco_original,
                (pp.preco - pr.preco_promocional) as desconto,
                ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 2) as percentual_desconto,
                COUNT(f.id_favorito) as total_favoritos
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
            LEFT JOIN tbl_favorito f ON p.id_produto = f.id_produto
            WHERE pr.data_inicio <= CURDATE() 
              AND pr.data_fim >= CURDATE()
            GROUP BY pr.id_promocao
            ORDER BY percentual_desconto DESC, total_favoritos DESC
            LIMIT ${limit}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR MELHORES PROMOÇÕES:", error);
        return false;
    }
};

// ================================ SELECT ALL PROMOCOES =================================
const selectAllPromocoes = async function () {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                e.nome as nome_estabelecimento,
                pp.preco as preco_original,
                (pp.preco - pr.preco_promocional) as desconto,
                ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 2) as percentual_desconto,
                CASE 
                    WHEN pr.data_inicio <= CURDATE() AND pr.data_fim >= CURDATE() THEN 'Ativa'
                    WHEN pr.data_inicio > CURDATE() THEN 'Futura'
                    ELSE 'Expirada'
                END as status_promocao
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
            ORDER BY pr.data_inicio DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO LISTAR TODAS AS PROMOÇÕES:", error);
        return false;
    }
};

// ================================ SELECT PROMOCOES EXPIRAM HOJE =================================
const selectPromocoesExpiramHoje = async function () {
    try {
        let sql = `
            SELECT 
                pr.*,
                p.nome as nome_produto,
                e.nome as nome_estabelecimento
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            WHERE pr.data_fim = CURDATE()
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES QUE EXPIRAM HOJE:", error);
        return false;
    }
};

// ================================ VERIFICAR PROMOCAO PRODUTO =================================
const verificarPromocaoProduto = async function (id_produto, id_estabelecimento) {
    try {
        let sql = `
            SELECT pr.*, pp.preco as preco_original
            FROM tbl_promocao pr
            LEFT JOIN tbl_precoProduto pp ON pr.id_produto = pp.id_produto 
              AND pr.id_estabelecimento = pp.id_estabelecimento
            WHERE pr.id_produto = ${id_produto} 
              AND pr.id_estabelecimento = ${id_estabelecimento}
              AND pr.data_inicio <= CURDATE() 
              AND pr.data_fim >= CURDATE()
            ORDER BY pr.preco_promocional ASC
            LIMIT 1
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO VERIFICAR PROMOÇÃO DO PRODUTO:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertPromocao,
    updatePromocao,
    deletePromocao,
    selectPromocaoById,
    selectPromocoesAtivas,
    selectPromocoesProduto,
    selectPromocoesEstabelecimento,
    selectMelhoresPromocoes,
    selectAllPromocoes,
    selectPromocoesExpiramHoje,
    verificarPromocaoProduto
};