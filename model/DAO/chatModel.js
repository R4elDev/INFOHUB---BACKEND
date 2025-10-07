/*****************************************************************************************
 * Objetivo --> Model responsável pela busca de promoções com menor preço e menor distância
 * Data --> 07/10/2025
 * Autor --> Israel
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================= SELECT =================================
const buscarPromocoes = async function (termo, id_usuario) {
    try {
        // 1️⃣ Busca a localização do usuário
        let sqlUsuario = `
            SELECT latitude, longitude
            FROM tbl_enderecoUsuario
            WHERE id_usuario = ${id_usuario};
        `;

        let localUsuario = await prisma.$queryRawUnsafe(sqlUsuario);

        if (!localUsuario || localUsuario.length === 0)
            return []; // usuário sem endereço cadastrado

        let latitude = localUsuario[0].latitude;
        let longitude = localUsuario[0].longitude;

        // 2️⃣ Busca promoções por menor preço e menor distância
        let sqlPromocoes = `
            SELECT 
                p.nome AS produto,
                e.nome AS estabelecimento,
                pr.preco_promocional,
                pr.data_inicio,
                pr.data_fim,
                ee.latitude,
                ee.longitude,
                (
                    6371 * ACOS(
                        COS(RADIANS(${latitude})) * COS(RADIANS(ee.latitude)) *
                        COS(RADIANS(ee.longitude) - RADIANS(${longitude})) +
                        SIN(RADIANS(${latitude})) * SIN(RADIANS(ee.latitude))
                    )
                ) AS distancia_km
            FROM tbl_promocao pr
            INNER JOIN tbl_produto p ON pr.id_produto = p.id_produto
            INNER JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
            INNER JOIN tbl_enderecoEstabelecimento ee ON e.id_estabelecimento = ee.id_estabelecimento
            WHERE p.nome LIKE '%${termo}%'
              AND pr.data_fim >= CURDATE()
            ORDER BY pr.preco_promocional ASC, distancia_km ASC
            LIMIT 5;
        `;

        let promocoes = await prisma.$queryRawUnsafe(sqlPromocoes);

        return promocoes;
    } catch (error) {
        console.log("ERRO AO BUSCAR PROMOÇÕES:", error);
        return false;
    }
};

module.exports = {
    buscarPromocoes
};
