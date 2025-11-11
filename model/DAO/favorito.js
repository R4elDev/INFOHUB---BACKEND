/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente aos FAVORITOS no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT FAVORITO =================================
const insertFavorito = async function (favorito) {
    try {
        // Verificar se já existe nos favoritos
        let sqlCheck = `
            SELECT * FROM tbl_favorito 
            WHERE id_usuario = ${favorito.id_usuario} 
            AND id_produto = ${favorito.id_produto}
        `;
        let existing = await prisma.$queryRawUnsafe(sqlCheck);

        if (existing.length > 0) {
            return { exists: true, message: "Produto já está nos favoritos" };
        }

        let sql = `
            INSERT INTO tbl_favorito (
                id_usuario, id_produto
            ) VALUES (
                ${favorito.id_usuario},
                ${favorito.id_produto}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT 
                    f.*,
                    p.nome as nome_produto,
                    p.descricao,
                    cat.nome as categoria
                FROM tbl_favorito f
                INNER JOIN tbl_produto p ON f.id_produto = p.id_produto
                LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
                WHERE f.id_usuario = ${favorito.id_usuario} 
                AND f.id_produto = ${favorito.id_produto}
            `;
            let favoritoCriado = await prisma.$queryRawUnsafe(sqlSelect);
            return favoritoCriado[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR FAVORITO:", error);
        return false;
    }
};

// ================================ DELETE FAVORITO =================================
const deleteFavorito = async function (id_usuario, id_produto) {
    try {
        let sql = `
            DELETE FROM tbl_favorito 
            WHERE id_usuario = ${id_usuario} 
            AND id_produto = ${id_produto}
        `;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR FAVORITO:", error);
        return false;
    }
};

// ================================ SELECT FAVORITOS BY USER =================================
const selectFavoritosUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                f.*,
                p.nome as nome_produto,
                p.descricao,
                cat.nome as categoria,
                -- Menor preço atual
                (SELECT MIN(pp.preco) 
                 FROM tbl_precoProduto pp 
                 WHERE pp.id_produto = f.id_produto) as preco_atual,
                -- Promoção ativa se existir
                pr.preco_promocional,
                pr.data_inicio as promocao_inicio,
                pr.data_fim as promocao_fim,
                -- Status se está em promoção
                CASE 
                    WHEN pr.id_promocao IS NOT NULL 
                    THEN 'Em Promoção' 
                    ELSE 'Normal' 
                END as status_promocao,
                -- Avaliação média do produto
                AVG(av.nota) as avaliacao_media,
                COUNT(av.id_avaliacao) as total_avaliacoes
            FROM tbl_favorito f
            INNER JOIN tbl_produto p ON f.id_produto = p.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            LEFT JOIN tbl_avaliacao av ON p.id_produto = av.id_produto
            WHERE f.id_usuario = ${id_usuario}
            GROUP BY f.id_favorito, p.id_produto, pr.id_promocao
            ORDER BY f.data_adicionado DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR FAVORITOS DO USUARIO:", error);
        return false;
    }
};

// ================================ CHECK SE É FAVORITO =================================
const checkIsFavorito = async function (id_usuario, id_produto) {
    try {
        let sql = `
            SELECT * FROM tbl_favorito 
            WHERE id_usuario = ${id_usuario} 
            AND id_produto = ${id_produto}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? true : false;
    } catch (error) {
        console.log("ERRO AO VERIFICAR SE É FAVORITO:", error);
        return false;
    }
};

// ================================ COUNT FAVORITOS =================================
const countFavoritosUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT COUNT(*) as total_favoritos
            FROM tbl_favorito 
            WHERE id_usuario = ${id_usuario}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0].total_favoritos : 0;
    } catch (error) {
        console.log("ERRO AO CONTAR FAVORITOS:", error);
        return 0;
    }
};

// ================================ FAVORITOS EM PROMOÇÃO =================================
const selectFavoritosEmPromocao = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                f.*,
                p.nome as nome_produto,
                p.descricao,
                cat.nome as categoria,
                pr.preco_promocional,
                pr.data_inicio,
                pr.data_fim,
                e.nome as nome_estabelecimento,
                -- Preço original
                (SELECT MIN(pp.preco) 
                 FROM tbl_precoProduto pp 
                 WHERE pp.id_produto = f.id_produto) as preco_original,
                -- Desconto percentual
                ROUND(
                    ((SELECT MIN(pp.preco) FROM tbl_precoProduto pp WHERE pp.id_produto = f.id_produto) - pr.preco_promocional) * 100 /
                    (SELECT MIN(pp.preco) FROM tbl_precoProduto pp WHERE pp.id_produto = f.id_produto), 2
                ) as desconto_percentual
            FROM tbl_favorito f
            INNER JOIN tbl_produto p ON f.id_produto = p.id_produto
            INNER JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            WHERE f.id_usuario = ${id_usuario}
            ORDER BY pr.preco_promocional ASC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR FAVORITOS EM PROMOÇÃO:", error);
        return false;
    }
};

// ================================ TOGGLE FAVORITO =================================
const toggleFavorito = async function (id_usuario, id_produto) {
    try {
        const isFavorito = await checkIsFavorito(id_usuario, id_produto);
        
        if (isFavorito) {
            // Se é favorito, remover
            const result = await deleteFavorito(id_usuario, id_produto);
            return { action: 'removed', success: result };
        } else {
            // Se não é favorito, adicionar
            const result = await insertFavorito({ id_usuario, id_produto });
            return { action: 'added', success: result && !result.exists, data: result };
        }
    } catch (error) {
        console.log("ERRO AO ALTERNAR FAVORITO:", error);
        return { action: 'error', success: false };
    }
};

// ================================ PRODUTOS MAIS FAVORITADOS =================================
const selectProdutosMaisFavoritados = async function (limit = 10) {
    try {
        let sql = `
            SELECT 
                p.id_produto,
                p.nome as nome_produto,
                p.descricao,
                cat.nome as categoria,
                COUNT(f.id_favorito) as total_favoritos,
                -- Menor preço atual
                (SELECT MIN(pp.preco) 
                 FROM tbl_precoProduto pp 
                 WHERE pp.id_produto = p.id_produto) as preco_atual,
                -- Promoção ativa
                pr.preco_promocional,
                -- Avaliação média
                AVG(av.nota) as avaliacao_media
            FROM tbl_produto p
            INNER JOIN tbl_favorito f ON p.id_produto = f.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
                AND pr.data_inicio <= CURDATE() 
                AND pr.data_fim >= CURDATE()
            LEFT JOIN tbl_avaliacao av ON p.id_produto = av.id_produto
            GROUP BY p.id_produto
            ORDER BY total_favoritos DESC
            LIMIT ${limit}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PRODUTOS MAIS FAVORITADOS:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertFavorito,
    deleteFavorito,
    selectFavoritosUsuario,
    checkIsFavorito,
    countFavoritosUsuario,
    selectFavoritosEmPromocao,
    toggleFavorito,
    selectProdutosMaisFavoritados
};