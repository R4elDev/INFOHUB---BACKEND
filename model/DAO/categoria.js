/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a categorias no BANCO DE DADOS
 * Data --> 09/10/2025
 * Autor --> ISRAEL
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertCategoria = async function (categoria) {
    try {
        let sql = `
            INSERT INTO tbl_categoria (
                nome
            ) VALUES (
                '${categoria.nome}'
            );
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT * 
                FROM tbl_categoria 
                WHERE nome = '${categoria.nome}' 
                ORDER BY id_categoria DESC 
                LIMIT 1;
            `;
            let categoriaCriada = await prisma.$queryRawUnsafe(sqlSelect);
            
            // Converter BigInt para Number
            if (categoriaCriada && categoriaCriada.length > 0) {
                return {
                    ...categoriaCriada[0],
                    id_categoria: Number(categoriaCriada[0].id_categoria)
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
const updateCategoria = async function (categoria) {
    try {
        let sql = `
            UPDATE tbl_categoria SET
                nome = '${categoria.nome}'
            WHERE id_categoria = ${categoria.id_categoria};
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
const deleteCategoria = async function (id_categoria) {
    try {
        // Verificar se existem produtos usando esta categoria
        let sqlCheck = `
            SELECT COUNT(*) as count 
            FROM tbl_produto 
            WHERE id_categoria = ${id_categoria};
        `;
        
        let [{count}] = await prisma.$queryRawUnsafe(sqlCheck);
        
        if (count > 0) {
            return false; // Não pode deletar categoria em uso
        }

        let sql = `
            DELETE FROM tbl_categoria 
            WHERE id_categoria = ${id_categoria};
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
const selectAllCategorias = async function () {
    try {
        let sql = `
            SELECT * FROM tbl_categoria;
        `;

        let rsCategorias = await prisma.$queryRawUnsafe(sql);

        return rsCategorias;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectCategoriaById = async function (id_categoria) {
    try {
        let sql = `
            SELECT * FROM tbl_categoria where id_categoria = ${id_categoria};
        `;

        let rsCategoria = await prisma.$queryRawUnsafe(sql);

        return rsCategoria;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectCategoriasComProdutos = async function () {
    try {
        let sql = `
            SELECT 
                c.id_categoria,
                c.nome,
                COUNT(p.id_produto) as total_produtos,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id_produto', p.id_produto,
                        'nome', p.nome,
                        'descricao', p.descricao,
                        'preco', pp.preco,
                        'preco_promocional', pr.preco_promocional,
                        'data_inicio_promocao', pr.data_inicio,
                        'data_fim_promocao', pr.data_fim
                    )
                ) as produtos
            FROM tbl_categoria c
            LEFT JOIN tbl_produto p ON p.id_categoria = c.id_categoria
            LEFT JOIN tbl_precoProduto pp ON pp.id_produto = p.id_produto
            LEFT JOIN tbl_promocao pr ON pr.id_produto = p.id_produto
                AND pr.id_estabelecimento = pp.id_estabelecimento
                AND CURRENT_DATE BETWEEN pr.data_inicio AND pr.data_fim
            GROUP BY c.id_categoria, c.nome;
        `;

        let rsCategorias = await prisma.$queryRawUnsafe(sql);

        // Converter a string JSON para objeto e tratar casos sem produtos
        rsCategorias = rsCategorias.map(categoria => {
            if (categoria.produtos && categoria.total_produtos > 0) {
                categoria.produtos = JSON.parse(categoria.produtos);
                // Remover valores null do array
                categoria.produtos = categoria.produtos.filter(p => p.id_produto !== null);
            } else {
                categoria.produtos = [];
            }
            return categoria;
        });

        return rsCategorias;

    } catch (error) {
        console.error(error);
        return false;
    }
}

const selectCategoriaComProdutosById = async function (id_categoria) {
    try {
        let sql = `
            SELECT 
                c.id_categoria,
                c.nome,
                COUNT(p.id_produto) as total_produtos,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id_produto', p.id_produto,
                        'nome', p.nome,
                        'descricao', p.descricao,
                        'preco', pp.preco,
                        'preco_promocional', pr.preco_promocional,
                        'data_inicio_promocao', pr.data_inicio,
                        'data_fim_promocao', pr.data_fim
                    )
                ) as produtos
            FROM tbl_categoria c
            LEFT JOIN tbl_produto p ON p.id_categoria = c.id_categoria
            LEFT JOIN tbl_precoProduto pp ON pp.id_produto = p.id_produto
            LEFT JOIN tbl_promocao pr ON pr.id_produto = p.id_produto
                AND pr.id_estabelecimento = pp.id_estabelecimento
                AND CURRENT_DATE BETWEEN pr.data_inicio AND pr.data_fim
            WHERE c.id_categoria = ${id_categoria}
            GROUP BY c.id_categoria, c.nome;
        `;

        let rsCategoria = await prisma.$queryRawUnsafe(sql);

        // Converter a string JSON para objeto e tratar casos sem produtos
        if (rsCategoria.length > 0) {
            if (rsCategoria[0].produtos && rsCategoria[0].total_produtos > 0) {
                rsCategoria[0].produtos = JSON.parse(rsCategoria[0].produtos);
                // Remover valores null do array
                rsCategoria[0].produtos = rsCategoria[0].produtos.filter(p => p.id_produto !== null);
            } else {
                rsCategoria[0].produtos = [];
            }
        }

        return rsCategoria;

    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    insertCategoria,
    updateCategoria,
    deleteCategoria,
    selectAllCategorias,
    selectCategoriaById,
    selectCategoriasComProdutos,
    selectCategoriaComProdutosById
}