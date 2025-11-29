/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de ENDEREÇO DE ESTABELECIMENTO no BANCO DE DADOS
 * Data --> 29/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertEnderecoEstabelecimento = async function (endereco) {
    try {
        // Verificar se já existe endereço para este estabelecimento
        let sqlCheck = `
            SELECT * FROM tbl_enderecoEstabelecimento 
            WHERE id_estabelecimento = ${endereco.id_estabelecimento}
        `;
        let existing = await prisma.$queryRawUnsafe(sqlCheck);

        if (existing.length > 0) {
            // Se já existe, atualizar
            return await updateEnderecoEstabelecimento({
                id_endereco: existing[0].id_endereco,
                ...endereco
            });
        }

        // Tratar latitude e longitude
        const latitude = endereco.latitude !== undefined && endereco.latitude !== null && endereco.latitude !== '' 
            ? endereco.latitude : null;
        const longitude = endereco.longitude !== undefined && endereco.longitude !== null && endereco.longitude !== '' 
            ? endereco.longitude : null;

        let sql = `
            INSERT INTO tbl_enderecoEstabelecimento (
                id_estabelecimento, cep, logradouro, numero, 
                complemento, bairro, cidade, estado, latitude, longitude
            ) VALUES (
                ${endereco.id_estabelecimento},
                '${endereco.cep}',
                '${endereco.logradouro || ''}',
                '${endereco.numero || ''}',
                ${endereco.complemento ? `'${endereco.complemento}'` : 'NULL'},
                '${endereco.bairro || ''}',
                '${endereco.cidade || ''}',
                '${endereco.estado || ''}',
                ${latitude !== null ? latitude : 'NULL'},
                ${longitude !== null ? longitude : 'NULL'}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            return await selectEnderecoByEstabelecimento(endereco.id_estabelecimento);
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR ENDEREÇO DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ UPDATE =================================
const updateEnderecoEstabelecimento = async function (endereco) {
    try {
        // Tratar latitude e longitude
        const latitude = endereco.latitude !== undefined && endereco.latitude !== null && endereco.latitude !== '' 
            ? endereco.latitude : null;
        const longitude = endereco.longitude !== undefined && endereco.longitude !== null && endereco.longitude !== '' 
            ? endereco.longitude : null;

        let sql = `
            UPDATE tbl_enderecoEstabelecimento SET
                cep = '${endereco.cep}',
                logradouro = '${endereco.logradouro || ''}',
                numero = '${endereco.numero || ''}',
                complemento = ${endereco.complemento ? `'${endereco.complemento}'` : 'NULL'},
                bairro = '${endereco.bairro || ''}',
                cidade = '${endereco.cidade || ''}',
                estado = '${endereco.estado || ''}',
                latitude = ${latitude !== null ? latitude : 'NULL'},
                longitude = ${longitude !== null ? longitude : 'NULL'}
            WHERE id_estabelecimento = ${endereco.id_estabelecimento}
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        
        if (result) {
            return await selectEnderecoByEstabelecimento(endereco.id_estabelecimento);
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR ENDEREÇO DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ DELETE =================================
const deleteEnderecoEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `DELETE FROM tbl_enderecoEstabelecimento WHERE id_estabelecimento = ${id_estabelecimento}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR ENDEREÇO DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ SELECT BY ESTABELECIMENTO =================================
const selectEnderecoByEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                e.*,
                est.nome as nome_estabelecimento
            FROM tbl_enderecoEstabelecimento e
            INNER JOIN tbl_estabelecimento est ON e.id_estabelecimento = est.id_estabelecimento
            WHERE e.id_estabelecimento = ${id_estabelecimento}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ENDEREÇO DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ SELECT BY ID =================================
const selectEnderecoById = async function (id_endereco) {
    try {
        let sql = `
            SELECT 
                e.*,
                est.nome as nome_estabelecimento
            FROM tbl_enderecoEstabelecimento e
            INNER JOIN tbl_estabelecimento est ON e.id_estabelecimento = est.id_estabelecimento
            WHERE e.id_endereco = ${id_endereco}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR ENDEREÇO POR ID:", error);
        return false;
    }
};

// ================================ PESQUISAR POR CEP =================================
const pesquisarEstabelecimentosPorCep = async function (cep) {
    try {
        // Remove caracteres não numéricos do CEP
        const cepLimpo = cep.replace(/\D/g, '');
        
        let sql = `
            SELECT 
                est.id_estabelecimento,
                est.nome,
                est.cnpj,
                est.telefone,
                e.cep,
                e.logradouro,
                e.numero,
                e.complemento,
                e.bairro,
                e.cidade,
                e.estado,
                e.latitude,
                e.longitude
            FROM tbl_estabelecimento est
            INNER JOIN tbl_enderecoEstabelecimento e ON est.id_estabelecimento = e.id_estabelecimento
            WHERE REPLACE(REPLACE(e.cep, '-', ''), '.', '') LIKE '%${cepLimpo}%'
            ORDER BY est.nome
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : [];
    } catch (error) {
        console.log("ERRO AO PESQUISAR ESTABELECIMENTOS POR CEP:", error);
        return [];
    }
};

// ================================ PESQUISAR POR CIDADE/BAIRRO =================================
const pesquisarEstabelecimentosPorLocal = async function (termo) {
    try {
        let sql = `
            SELECT 
                est.id_estabelecimento,
                est.nome,
                est.cnpj,
                est.telefone,
                e.cep,
                e.logradouro,
                e.numero,
                e.complemento,
                e.bairro,
                e.cidade,
                e.estado,
                e.latitude,
                e.longitude
            FROM tbl_estabelecimento est
            INNER JOIN tbl_enderecoEstabelecimento e ON est.id_estabelecimento = e.id_estabelecimento
            WHERE e.cidade LIKE '%${termo}%'
               OR e.bairro LIKE '%${termo}%'
               OR e.logradouro LIKE '%${termo}%'
               OR est.nome LIKE '%${termo}%'
            ORDER BY est.nome
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : [];
    } catch (error) {
        console.log("ERRO AO PESQUISAR ESTABELECIMENTOS POR LOCAL:", error);
        return [];
    }
};

// ================================ PESQUISAR PRÓXIMOS (POR COORDENADAS) =================================
const pesquisarEstabelecimentosProximos = async function (latitude, longitude, raioKm = 10) {
    try {
        // Fórmula de Haversine para calcular distância em km
        let sql = `
            SELECT 
                est.id_estabelecimento,
                est.nome,
                est.cnpj,
                est.telefone,
                e.cep,
                e.logradouro,
                e.numero,
                e.complemento,
                e.bairro,
                e.cidade,
                e.estado,
                e.latitude,
                e.longitude,
                (6371 * ACOS(
                    COS(RADIANS(${latitude})) * COS(RADIANS(e.latitude)) * 
                    COS(RADIANS(e.longitude) - RADIANS(${longitude})) + 
                    SIN(RADIANS(${latitude})) * SIN(RADIANS(e.latitude))
                )) AS distancia_km
            FROM tbl_estabelecimento est
            INNER JOIN tbl_enderecoEstabelecimento e ON est.id_estabelecimento = e.id_estabelecimento
            WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
            HAVING distancia_km <= ${raioKm}
            ORDER BY distancia_km ASC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : [];
    } catch (error) {
        console.log("ERRO AO PESQUISAR ESTABELECIMENTOS PRÓXIMOS:", error);
        return [];
    }
};

// ================================ LISTAR TODOS COM ENDEREÇO =================================
const listarEstabelecimentosComEndereco = async function () {
    try {
        let sql = `
            SELECT 
                est.id_estabelecimento,
                est.nome,
                est.cnpj,
                est.telefone,
                e.cep,
                e.logradouro,
                e.numero,
                e.complemento,
                e.bairro,
                e.cidade,
                e.estado,
                e.latitude,
                e.longitude
            FROM tbl_estabelecimento est
            LEFT JOIN tbl_enderecoEstabelecimento e ON est.id_estabelecimento = e.id_estabelecimento
            ORDER BY est.nome
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : [];
    } catch (error) {
        console.log("ERRO AO LISTAR ESTABELECIMENTOS COM ENDEREÇO:", error);
        return [];
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertEnderecoEstabelecimento,
    updateEnderecoEstabelecimento,
    deleteEnderecoEstabelecimento,
    selectEnderecoByEstabelecimento,
    selectEnderecoById,
    pesquisarEstabelecimentosPorCep,
    pesquisarEstabelecimentosPorLocal,
    pesquisarEstabelecimentosProximos,
    listarEstabelecimentosComEndereco
};
