/**
 * DAO para Posts - Sistema de Rede Social InfoHub
 * Corrigido para usar os campos corretos do banco de dados
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT POST =================================
const insertPost = async function (post) {
    try {
        let sql = `
            INSERT INTO tbl_post (
                id_usuario, titulo, conteudo, imagem, id_produto, id_estabelecimento
            ) VALUES (
                ${post.id_usuario},
                ${post.titulo ? `'${post.titulo}'` : 'NULL'},
                ${post.conteudo ? `'${post.conteudo}'` : 'NULL'},
                ${post.imagem ? `'${post.imagem}'` : 'NULL'},
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
                ${post.titulo ? `titulo = '${post.titulo}',` : ''}
                ${post.conteudo ? `conteudo = '${post.conteudo}',` : ''}
                ${post.imagem ? `imagem = '${post.imagem}',` : ''}
                ${post.id_produto ? `id_produto = ${post.id_produto},` : ''}
                ${post.id_estabelecimento ? `id_estabelecimento = ${post.id_estabelecimento},` : ''}
                id_post = ${post.id_post}
            WHERE id_post = ${post.id_post}
        `;

        // Remover vírgula final se existir
        sql = sql.replace(/,(\s*id_post = \d+)/, '$1');

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
        // Primeiro deletar comentários e curtidas
        let sqlComentarios = `DELETE FROM tbl_comentario WHERE id_post = ${id_post}`;
        await prisma.$executeRawUnsafe(sqlComentarios);

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

        let rsPost = await prisma.$queryRawUnsafe(sql);
        return rsPost.length > 0 ? rsPost[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POST POR ID:", error);
        return false;
    }
};

// ================================ SELECT POSTS BY USER =================================
const selectPostsUsuario = async function (id_usuario, limite = 10) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
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
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;

        let rsPosts = await prisma.$queryRawUnsafe(sql);
        return rsPosts || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS DO USUARIO:", error);
        return [];
    }
};

// ================================ SELECT ALL POSTS =================================
const selectAllPosts = async function (limite = 50) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
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
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;

        let rsPosts = await prisma.$queryRawUnsafe(sql);
        return rsPosts || [];
    } catch (error) {
        console.log("ERRO AO LISTAR TODOS OS POSTS:", error);
        return [];
    }
};

// ================================ SELECT POSTS BY PRODUCT =================================
const selectPostsByProduto = async function (id_produto) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
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
            ORDER BY p.data_criacao DESC
        `;

        let rsPosts = await prisma.$queryRawUnsafe(sql);
        return rsPosts || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS POR PRODUTO:", error);
        return [];
    }
};

// ================================ SELECT POSTS BY ESTABLISHMENT =================================
const selectPostsByEstabelecimento = async function (id_estabelecimento) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
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
            ORDER BY p.data_criacao DESC
        `;

        let rsPosts = await prisma.$queryRawUnsafe(sql);
        return rsPosts || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS POR ESTABELECIMENTO:", error);
        return [];
    }
};

// ================================ LIKE/UNLIKE POST =================================
const toggleCurtidaPost = async function (id_post, id_usuario) {
    try {
        // Verificar se já curtiu
        let sqlVerifica = `
            SELECT id_curtida FROM tbl_curtida 
            WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
        `;
        
        let curtidaExistente = await prisma.$queryRawUnsafe(sqlVerifica);

        if (curtidaExistente && curtidaExistente.length > 0) {
            // Descurtir
            let sqlRemover = `
                DELETE FROM tbl_curtida 
                WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
            `;
            await prisma.$executeRawUnsafe(sqlRemover);
            return { curtiu: false, mensagem: "Curtida removida" };
        } else {
            // Curtir
            let sqlAdicionar = `
                INSERT INTO tbl_curtida (id_post, id_usuario)
                VALUES (${id_post}, ${id_usuario})
            `;
            await prisma.$executeRawUnsafe(sqlAdicionar);
            return { curtiu: true, mensagem: "Post curtido" };
        }
    } catch (error) {
        console.log("ERRO AO CURTIR/DESCURTIR POST:", error);
        return false;
    }
};

// ================================ ADD COMMENT =================================
const adicionarComentario = async function (comentario) {
    try {
        let sql = `
            INSERT INTO tbl_comentario (id_post, id_usuario, conteudo)
            VALUES (${comentario.id_post}, ${comentario.id_usuario}, '${comentario.conteudo}')
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar o comentário criado
            let sqlSelect = `
                SELECT 
                    c.*,
                    u.nome as nome_usuario
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
        console.log("ERRO AO ADICIONAR COMENTÁRIO:", error);
        return false;
    }
};

// ================================ GET COMMENTS =================================
const selectComentariosByPost = async function (id_post) {
    try {
        let sql = `
            SELECT 
                c.*,
                u.nome as nome_usuario
            FROM tbl_comentario c
            INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_post = ${id_post}
            ORDER BY c.data_criacao ASC
        `;

        let rsComentarios = await prisma.$queryRawUnsafe(sql);
        return rsComentarios || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR COMENTÁRIOS:", error);
        return [];
    }
};

// ================================ GET FEED (POSTS RECENTES) =================================
const getFeedPosts = async function (limite = 20) {
    try {
        let sql = `
            SELECT 
                p.*,
                u.nome as nome_usuario,
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
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;

        let rsPosts = await prisma.$queryRawUnsafe(sql);
        return rsPosts || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR FEED:", error);
        return [];
    }
};

module.exports = {
    insertPost,
    updatePost,
    deletePost,
    selectPostById,
    selectPostsUsuario,
    selectAllPosts,
    selectPostsByProduto,
    selectPostsByEstabelecimento,
    toggleCurtidaPost,
    adicionarComentario,
    selectComentariosByPost,
    getFeedPosts
};