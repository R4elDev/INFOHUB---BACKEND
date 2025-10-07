/*****************************************************************************************
 * Objetivo --> DAO responsável pela busca de promoções considerando preço e distância
 * Data --> 07/10/2025
 * Autor --> Israel
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const buscarPromocoes = async function (termoBusca, idUsuario, radiusKm = 10, maxResults = 10) {
    try {
        const uid = Number(idUsuario) || 0;
        const safeTerm = String(termoBusca || '').replace(/'/g, "''");

        // Query para pegar coordenadas do usuário
        let usuarioCoords = await prisma.$queryRawUnsafe(`
            SELECT latitude, longitude 
            FROM tbl_enderecoUsuario 
            WHERE id_usuario = ${uid}
            ORDER BY id_endereco DESC
            LIMIT 1;
        `);

        if (!usuarioCoords || usuarioCoords.length === 0) {
            return [];
        }

        let { latitude, longitude } = usuarioCoords[0];

        let hoje = new Date().toISOString().split("T")[0];

        let sql = `
            SELECT 
                promo.id_promocao,
                prod.id_produto, prod.nome AS produto,
                cat.nome AS categoria,
                est.id_estabelecimento, est.nome AS estabelecimento,
                endest.cidade, endest.estado,
                endest.latitude, endest.longitude,
                promo.preco_promocional, promo.data_inicio, promo.data_fim,
                (
                    6371 * acos(
                        cos(radians(${latitude})) 
                        * cos(radians(endest.latitude)) 
                        * cos(radians(endest.longitude) - radians(${longitude})) 
                        + sin(radians(${latitude})) 
                        * sin(radians(endest.latitude))
                    )
                ) AS distance_km
            FROM tbl_promocao AS promo
            JOIN tbl_produto AS prod ON prod.id_produto = promo.id_produto
            LEFT JOIN tbl_categoria AS cat ON cat.id_categoria = prod.id_categoria
            JOIN tbl_estabelecimento AS est ON est.id_estabelecimento = promo.id_estabelecimento
            JOIN tbl_enderecoEstabelecimento AS endest ON endest.id_estabelecimento = est.id_estabelecimento
            WHERE promo.data_inicio <= '${hoje}' AND promo.data_fim >= '${hoje}'
                AND prod.nome LIKE '%${safeTerm}%'
            HAVING distance_km <= ${radiusKm}
            ORDER BY promo.preco_promocional ASC, distance_km ASC
            LIMIT ${maxResults};
        `;

        let promocoes = await prisma.$queryRawUnsafe(sql);

        return promocoes;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES:", error);
        return [];
    }
};

module.exports = {
    buscarPromocoes
};
