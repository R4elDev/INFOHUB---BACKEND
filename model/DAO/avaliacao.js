/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente as AVALIAÇÕES no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT AVALIAÇÃO =================================
const insertAvaliacao = async function (avaliacao) {
    try {
        // Verificar se usuário já avaliou este item
        let sqlCheck = `
            SELECT * FROM tbl_avaliacao 
            WHERE id_usuario = ${avaliacao.id_usuario} 
            AND ${avaliacao.id_produto ? `id_produto = ${avaliacao.id_produto}` : `id_estabelecimento = ${avaliacao.id_estabelecimento}`}
        `;
        let existing = await prisma.$queryRawUnsafe(sqlCheck);

        if (existing.length > 0) {
            // Se já avaliou, atualizar avaliação existente
            return await updateAvaliacao({
                id_avaliacao: existing[0].id_avaliacao,
                nota: avaliacao.nota,
                comentario: avaliacao.comentario
            });
        }

        let sql = `
            INSERT INTO tbl_avaliacao (
                id_usuario, 
                ${avaliacao.id_produto ? 'id_produto,' : ''} 
                ${avaliacao.id_estabelecimento ? 'id_estabelecimento,' : ''}
                nota, 
                comentario
            ) VALUES (
                ${avaliacao.id_usuario},
                ${avaliacao.id_produto ? `${avaliacao.id_produto},` : ''}
                ${avaliacao.id_estabelecimento ? `${avaliacao.id_estabelecimento},` : ''}
                ${avaliacao.nota},
                ${avaliacao.comentario ? `'${avaliacao.comentario}'` : 'NULL'}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT 
                    a.*,
                    u.nome as nome_usuario,
                    ${avaliacao.id_produto ? 'p.nome as nome_produto,' : ''}
                    ${avaliacao.id_estabelecimento ? 'e.nome as nome_estabelecimento,' : ''}
                    DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y às %H:%i') as data_formatada
                FROM tbl_avaliacao a
                INNER JOIN tbl_usuario u ON a.id_usuario = u.id_usuario
                ${avaliacao.id_produto ? 'LEFT JOIN tbl_produto p ON a.id_produto = p.id_produto' : ''}
                ${avaliacao.id_estabelecimento ? 'LEFT JOIN tbl_estabelecimento e ON a.id_estabelecimento = e.id_estabelecimento' : ''}
                WHERE a.id_usuario = ${avaliacao.id_usuario}
                ORDER BY a.id_avaliacao DESC 
                LIMIT 1
            `;
            let avaliacaoCriada = await prisma.$queryRawUnsafe(sqlSelect);
            return avaliacaoCriada[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR AVALIAÇÃO:", error);
        return false;
    }
};

// ================================ UPDATE AVALIAÇÃO =================================
const updateAvaliacao = async function (avaliacao) {
    try {
        let sql = `
            UPDATE tbl_avaliacao SET
                ${avaliacao.nota ? `nota = ${avaliacao.nota},` : ''}
                ${avaliacao.comentario ? `comentario = '${avaliacao.comentario}',` : ''}
                data_avaliacao = NOW()
            WHERE id_avaliacao = ${avaliacao.id_avaliacao}
        `;

        // Remover vírgula final se existir
        sql = sql.replace(/,\s*WHERE/, ' WHERE');

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR AVALIAÇÃO:", error);
        return false;
    }
};

// ================================ DELETE AVALIAÇÃO =================================
const deleteAvaliacao = async function (id_avaliacao) {
    try {
        let sql = `DELETE FROM tbl_avaliacao WHERE id_avaliacao = ${id_avaliacao}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR AVALIAÇÃO:", error);
        return false;
    }
};

// ================================ SELECT AVALIAÇÕES BY PRODUTO =================================
const selectAvaliacoesProduto = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                a.*,
                u.nome as nome_usuario,
                DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y às %H:%i') as data_formatada,
                -- Tempo relativo
                CASE 
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) = 0 
                    THEN 'Hoje'
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) = 1 
                    THEN 'Ontem'
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) <= 7 
                    THEN CONCAT(TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()), ' dias atrás')
                    ELSE DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y')
                END as tempo_relativo
            FROM tbl_avaliacao a
            INNER JOIN tbl_usuario u ON a.id_usuario = u.id_usuario
            WHERE a.id_produto = ${id_produto}
            ORDER BY a.data_avaliacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR AVALIAÇÕES DO PRODUTO:", error);
        return false;
    }
};

// ================================ SELECT AVALIAÇÕES BY ESTABELECIMENTO =================================
const selectAvaliacoesEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                a.*,
                u.nome as nome_usuario,
                DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y às %H:%i') as data_formatada,
                -- Tempo relativo
                CASE 
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) = 0 
                    THEN 'Hoje'
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) = 1 
                    THEN 'Ontem'
                    WHEN TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()) <= 7 
                    THEN CONCAT(TIMESTAMPDIFF(DAY, a.data_avaliacao, NOW()), ' dias atrás')
                    ELSE DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y')
                END as tempo_relativo
            FROM tbl_avaliacao a
            INNER JOIN tbl_usuario u ON a.id_usuario = u.id_usuario
            WHERE a.id_estabelecimento = ${id_estabelecimento}
            ORDER BY a.data_avaliacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR AVALIAÇÕES DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ SELECT AVALIAÇÕES BY USER =================================
const selectAvaliacoesUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                a.*,
                p.nome as nome_produto,
                e.nome as nome_estabelecimento,
                DATE_FORMAT(a.data_avaliacao, '%d/%m/%Y às %H:%i') as data_formatada,
                CASE 
                    WHEN a.id_produto IS NOT NULL THEN 'Produto'
                    ELSE 'Estabelecimento'
                END as tipo_avaliacao
            FROM tbl_avaliacao a
            LEFT JOIN tbl_produto p ON a.id_produto = p.id_produto
            LEFT JOIN tbl_estabelecimento e ON a.id_estabelecimento = e.id_estabelecimento
            WHERE a.id_usuario = ${id_usuario}
            ORDER BY a.data_avaliacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR AVALIAÇÕES DO USUÁRIO:", error);
        return false;
    }
};

// ================================ ESTATÍSTICAS PRODUTO =================================
const getEstatisticasProduto = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_avaliacoes,
                AVG(nota) as media_notas,
                ROUND(AVG(nota), 1) as media_formatada,
                -- Distribuição das notas
                SUM(CASE WHEN nota = 5 THEN 1 ELSE 0 END) as nota_5,
                SUM(CASE WHEN nota = 4 THEN 1 ELSE 0 END) as nota_4,
                SUM(CASE WHEN nota = 3 THEN 1 ELSE 0 END) as nota_3,
                SUM(CASE WHEN nota = 2 THEN 1 ELSE 0 END) as nota_2,
                SUM(CASE WHEN nota = 1 THEN 1 ELSE 0 END) as nota_1,
                -- Percentuais
                ROUND((SUM(CASE WHEN nota = 5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_5,
                ROUND((SUM(CASE WHEN nota = 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_4,
                ROUND((SUM(CASE WHEN nota = 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_3,
                ROUND((SUM(CASE WHEN nota = 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_2,
                ROUND((SUM(CASE WHEN nota = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_1
            FROM tbl_avaliacao 
            WHERE id_produto = ${id_produto}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ESTATÍSTICAS DO PRODUTO:", error);
        return false;
    }
};

// ================================ ESTATÍSTICAS ESTABELECIMENTO =================================
const getEstatisticasEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                COUNT(*) as total_avaliacoes,
                AVG(nota) as media_notas,
                ROUND(AVG(nota), 1) as media_formatada,
                -- Distribuição das notas
                SUM(CASE WHEN nota = 5 THEN 1 ELSE 0 END) as nota_5,
                SUM(CASE WHEN nota = 4 THEN 1 ELSE 0 END) as nota_4,
                SUM(CASE WHEN nota = 3 THEN 1 ELSE 0 END) as nota_3,
                SUM(CASE WHEN nota = 2 THEN 1 ELSE 0 END) as nota_2,
                SUM(CASE WHEN nota = 1 THEN 1 ELSE 0 END) as nota_1,
                -- Percentuais
                ROUND((SUM(CASE WHEN nota = 5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_5,
                ROUND((SUM(CASE WHEN nota = 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_4,
                ROUND((SUM(CASE WHEN nota = 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_3,
                ROUND((SUM(CASE WHEN nota = 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_2,
                ROUND((SUM(CASE WHEN nota = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) as perc_1
            FROM tbl_avaliacao 
            WHERE id_estabelecimento = ${id_estabelecimento}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ESTATÍSTICAS DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ CHECK SE USUÁRIO PODE AVALIAR =================================
const checkPodeAvaliar = async function (id_usuario, id_produto, id_estabelecimento) {
    try {
        // Verificar se o usuário comprou o produto/estabelecimento
        let sql = `
            SELECT c.id_compra
            FROM tbl_compra c
            ${id_produto ? 'INNER JOIN tbl_itemCompra ic ON c.id_compra = ic.id_compra' : ''}
            WHERE c.id_usuario = ${id_usuario}
            AND c.status_compra = 'entregue'
            ${id_produto ? `AND ic.id_produto = ${id_produto}` : ''}
            ${id_estabelecimento ? `AND c.id_estabelecimento = ${id_estabelecimento}` : ''}
            LIMIT 1
        `;
        
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? true : false;
    } catch (error) {
        console.log("ERRO AO VERIFICAR SE PODE AVALIAR:", error);
        return false;
    }
};

// ================================ PRODUTOS MAIS BEM AVALIADOS =================================
const selectProdutosMaisBemAvaliados = async function (limit = 10) {
    try {
        let sql = `
            SELECT 
                p.id_produto,
                p.nome as nome_produto,
                p.descricao,
                cat.nome as categoria,
                COUNT(a.id_avaliacao) as total_avaliacoes,
                AVG(a.nota) as media_notas,
                ROUND(AVG(a.nota), 1) as media_formatada,
                -- Menor preço atual
                (SELECT MIN(pp.preco) 
                 FROM tbl_precoProduto pp 
                 WHERE pp.id_produto = p.id_produto) as preco_atual
            FROM tbl_produto p
            INNER JOIN tbl_avaliacao a ON p.id_produto = a.id_produto
            LEFT JOIN tbl_categoria cat ON p.id_categoria = cat.id_categoria
            GROUP BY p.id_produto
            HAVING COUNT(a.id_avaliacao) >= 3  -- Mínimo de 3 avaliações
            ORDER BY media_notas DESC, total_avaliacoes DESC
            LIMIT ${limit}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR PRODUTOS MAIS BEM AVALIADOS:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertAvaliacao,
    updateAvaliacao,
    deleteAvaliacao,
    selectAvaliacoesProduto,
    selectAvaliacoesEstabelecimento,
    selectAvaliacoesUsuario,
    getEstatisticasProduto,
    getEstatisticasEstabelecimento,
    checkPodeAvaliar,
    selectProdutosMaisBemAvaliados
};