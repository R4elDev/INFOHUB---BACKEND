/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a POSTS no BANCO DE DADOS
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT POST =================================
const insertPost = async function (post) {
    try {
        let sql = `
            INSERT INTO tbl_post (
                id_usuario, conteudo, foto_url, id_produto, id_estabelecimento
            ) VALUES (
                ${post.id_usuario},
                '${post.conteudo}',
                ${post.foto_url ? `'${post.foto_url}'` : 'NULL'},
                ${post.id_produto || 'NULL'},
                ${post.id_estabelecimento || 'NULL'}
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar o post criado
            let sqlSelect = `
                SELECT * FROM tbl_post 
                WHERE id_usuario = ${post.id_usuario}
                ORDER BY id_post DESC 
                LIMIT 1
            `;
            let postCriado = await prisma.$queryRawUnsafe(sqlSelect);
            return postCriado[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR POST:", error);
        return false;
    }
};

// ================================ UPDATE POST =================================
const updatePost = async function (post) {
    try {
        let sql = `
            UPDATE tbl_post SET
                ${post.conteudo ? `conteudo = '${post.conteudo}',` : ''}
                ${post.foto_url ? `foto_url = '${post.foto_url}',` : ''}
                ${post.id_produto ? `id_produto = ${post.id_produto},` : ''}
                ${post.id_estabelecimento ? `id_estabelecimento = ${post.id_estabelecimento},` : ''}
                id_post = ${post.id_post}
            WHERE id_post = ${post.id_post}
        `;

        // Remover vírgula final se existir
        sql = sql.replace(/,\s*WHERE/, ' WHERE');

        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR POST:", error);
        return false;
    }
};

// ================================ DELETE POST =================================
const deletePost = async function (id_post) {
    try {
        // Primeiro deletar comentários do post
        let sqlComentarios = `DELETE FROM tbl_comentario WHERE id_post = ${id_post}`;
        await prisma.$executeRawUnsafe(sqlComentarios);

        // Deletar curtidas do post
        let sqlCurtidas = `DELETE FROM tbl_curtida WHERE id_post = ${id_post}`;
        await prisma.$executeRawUnsafe(sqlCurtidas);

        // Depois deletar o post
        let sql = `DELETE FROM tbl_post WHERE id_post = ${id_post}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR POST:", error);
        return false;
    }
};

// ================================ SELECT POST BY ID =================================
const selectPostById = async function (id_post) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario,
                pr.nome as nome_produto,
                e.nome as nome_estabelecimento,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_produto pr ON p.id_produto = pr.id_produto
            LEFT JOIN tbl_estabelecimento e ON p.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_post = ${id_post}
            GROUP BY p.id_post
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POST POR ID:", error);
        return false;
    }
};

// ================================ SELECT POSTS BY USER =================================
const selectPostsUsuario = async function (id_usuario) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario,
                pr.nome as nome_produto,
                e.nome as nome_estabelecimento,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_produto pr ON p.id_produto = pr.id_produto
            LEFT JOIN tbl_estabelecimento e ON p.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_usuario = ${id_usuario}
            GROUP BY p.id_post
            ORDER BY p.data_publicacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS DO USUARIO:", error);
        return false;
    }
};

// ================================ SELECT ALL POSTS (FEED) =================================
const selectAllPosts = async function (limit = 20, offset = 0) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario,
                pr.nome as nome_produto,
                e.nome as nome_estabelecimento,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_produto pr ON p.id_produto = pr.id_produto
            LEFT JOIN tbl_estabelecimento e ON p.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            GROUP BY p.id_post
            ORDER BY p.data_publicacao DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO LISTAR TODOS OS POSTS:", error);
        return false;
    }
};

// ================================ SELECT POSTS BY PRODUTO =================================
const selectPostsProduto = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario,
                pr.nome as nome_produto,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            INNER JOIN tbl_produto pr ON p.id_produto = pr.id_produto
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_produto = ${id_produto}
            GROUP BY p.id_post
            ORDER BY p.data_publicacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS DO PRODUTO:", error);
        return false;
    }
};

// ================================ SELECT POSTS BY ESTABELECIMENTO =================================
const selectPostsEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario,
                e.nome as nome_estabelecimento,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            INNER JOIN tbl_estabelecimento e ON p.id_estabelecimento = e.id_estabelecimento
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_estabelecimento = ${id_estabelecimento}
            GROUP BY p.id_post
            ORDER BY p.data_publicacao DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS DO ESTABELECIMENTO:", error);
        return false;
    }
};

// ================================ INSERT COMENTARIO =================================
const insertComentario = async function (comentario) {
    try {
        let sql = `
            INSERT INTO tbl_comentario (
                id_post, id_usuario, conteudo
            ) VALUES (
                ${comentario.id_post},
                ${comentario.id_usuario},
                '${comentario.conteudo}'
            )
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar o comentário criado
            let sqlSelect = `
                SELECT 
                    c.*,
                    u.nome as nome_usuario,
                    u.foto_url as foto_usuario
                FROM tbl_comentario c
                INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
                WHERE c.id_post = ${comentario.id_post} 
                  AND c.id_usuario = ${comentario.id_usuario}
                ORDER BY c.id_comentario DESC 
                LIMIT 1
            `;
            let comentarioCriado = await prisma.$queryRawUnsafe(sqlSelect);
            return comentarioCriado[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR COMENTÁRIO:", error);
        return false;
    }
};

// ================================ SELECT COMENTARIOS POST =================================
const selectComentariosPost = async function (id_post) {
    try {
        let sql = `
            SELECT 
                c.*,
                u.nome as nome_usuario,
                u.foto_url as foto_usuario
            FROM tbl_comentario c
            INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_post = ${id_post}
            ORDER BY c.data_comentario DESC
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR COMENTÁRIOS DO POST:", error);
        return false;
    }
};

// ================================ DELETE COMENTARIO =================================
const deleteComentario = async function (id_comentario) {
    try {
        let sql = `DELETE FROM tbl_comentario WHERE id_comentario = ${id_comentario}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR COMENTÁRIO:", error);
        return false;
    }
};

// ================================ INSERT/DELETE CURTIDA =================================
const toggleCurtida = async function (id_post, id_usuario) {
    try {
        // Verificar se já curtiu
        let sqlCheck = `
            SELECT id_curtida FROM tbl_curtida 
            WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
        `;
        let curtidaExistente = await prisma.$queryRawUnsafe(sqlCheck);

        if (curtidaExistente && curtidaExistente.length > 0) {
            // Remover curtida
            let sqlDelete = `
                DELETE FROM tbl_curtida 
                WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
            `;
            await prisma.$executeRawUnsafe(sqlDelete);
            return { curtido: false, acao: 'removida' };
        } else {
            // Adicionar curtida
            let sqlInsert = `
                INSERT INTO tbl_curtida (id_post, id_usuario) 
                VALUES (${id_post}, ${id_usuario})
            `;
            await prisma.$executeRawUnsafe(sqlInsert);
            return { curtido: true, acao: 'adicionada' };
        }
    } catch (error) {
        console.log("ERRO AO ALTERNAR CURTIDA:", error);
        return false;
    }
};

// ================================ COUNT CURTIDAS POST =================================
const countCurtidasPost = async function (id_post) {
    try {
        let sql = `SELECT COUNT(*) as total FROM tbl_curtida WHERE id_post = ${id_post}`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result[0].total;
    } catch (error) {
        console.log("ERRO AO CONTAR CURTIDAS:", error);
        return 0;
    }
};

// ================================ VERIFICAR CURTIDA USUARIO =================================
const verificarCurtidaUsuario = async function (id_post, id_usuario) {
    try {
        let sql = `
            SELECT id_curtida FROM tbl_curtida 
            WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
        `;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0;
    } catch (error) {
        console.log("ERRO AO VERIFICAR CURTIDA:", error);
        return false;
    }
};

// ================================ EXPORTS =================================
module.exports = {
    insertPost,
    updatePost,
    deletePost,
    selectPostById,
    selectPostsUsuario,
    selectAllPosts,
    selectPostsProduto,
    selectPostsEstabelecimento,
    insertComentario,
    selectComentariosPost,
    deleteComentario,
    toggleCurtida,
    countCurtidasPost,
    verificarCurtidaUsuario
};