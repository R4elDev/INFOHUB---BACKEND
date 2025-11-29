/**
 * DAO para Posts - Sistema de Rede Social InfoHub
 * Corrigido para usar os campos corretos do banco de dados
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT POST =================================
const insertPost = async function (post) {
    try {
        console.log("DADOS RECEBIDOS PARA INSERT:", post);
        
        // Usar prepared statement para evitar SQL injection
        let result = await prisma.$executeRaw`
            INSERT INTO tbl_post (
                id_usuario, titulo, conteudo, imagem
            ) VALUES (
                ${post.id_usuario},
                ${post.titulo || null},
                ${post.conteudo || null},
                ${post.imagem || null}
            )
        `;

        console.log("RESULTADO INSERT:", result);

        if (result) {
            // Buscar o post criado usando prepared statement
            let postCriado = await prisma.$queryRaw`
                SELECT * FROM tbl_post 
                WHERE id_usuario = ${post.id_usuario}
                ORDER BY id_post DESC 
                LIMIT 1
            `;
            console.log("POST CRIADO:", postCriado[0]);
            return postCriado[0];
        }
        
        return false;
    } catch (error) {
        console.log("ERRO AO INSERIR POST:", error);
        console.log("DETALHES DO ERRO:", error.message);
        return false;
    }
};

// ================================ UPDATE POST =================================
const updatePost = async function (post) {
    try {
        // Usar SQL condicional para cada campo
        let result = 0;
        
        if (post.titulo !== undefined) {
            result = await prisma.$executeRaw`
                UPDATE tbl_post SET titulo = ${post.titulo}
                WHERE id_post = ${post.id_post}
            `;
        }
        if (post.conteudo !== undefined) {
            result = await prisma.$executeRaw`
                UPDATE tbl_post SET conteudo = ${post.conteudo}
                WHERE id_post = ${post.id_post}
            `;
        }
        if (post.imagem !== undefined) {
            result = await prisma.$executeRaw`
                UPDATE tbl_post SET imagem = ${post.imagem}
                WHERE id_post = ${post.id_post}
            `;
        }
        
        return result > 0;
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
        let rsPost = await prisma.$queryRaw`
            SELECT 
                p.*,
                u.nome as nome_usuario,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_post = ${id_post}
            GROUP BY p.id_post
        `;
        if (rsPost.length > 0) {
            return {
                ...rsPost[0],
                total_comentarios: Number(rsPost[0].total_comentarios),
                total_curtidas: Number(rsPost[0].total_curtidas)
            };
        }
        return false;
    } catch (error) {
        console.log("ERRO AO BUSCAR POST POR ID:", error);
        return false;
    }
};

// ================================ SELECT POSTS BY USER =================================
const selectPostsUsuario = async function (id_usuario, limite = 10) {
    try {
        let rsPosts = await prisma.$queryRaw`
            SELECT 
                p.*,
                u.nome as nome_usuario,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            WHERE p.id_usuario = ${id_usuario}
            GROUP BY p.id_post
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;
        // Converter BigInt para Number
        const postsFormatados = rsPosts.map(post => ({
            ...post,
            total_comentarios: Number(post.total_comentarios),
            total_curtidas: Number(post.total_curtidas)
        }));
        return postsFormatados || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS DO USUARIO:", error);
        return [];
    }
};

// ================================ SELECT ALL POSTS =================================
const selectAllPosts = async function (limite = 50) {
    try {
        let rsPosts = await prisma.$queryRaw`
            SELECT 
                p.*,
                u.nome as nome_usuario,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            GROUP BY p.id_post
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;
        const postsFormatados = rsPosts.map(post => ({
            ...post,
            total_comentarios: Number(post.total_comentarios),
            total_curtidas: Number(post.total_curtidas)
        }));
        return postsFormatados || [];
    } catch (error) {
        console.log("ERRO AO LISTAR TODOS OS POSTS:", error);
        return [];
    }
};

// ================================ SELECT POSTS BY PRODUCT =================================
// FUNÇÃO DESABILITADA - Campo id_produto não existe na tabela tbl_post
const selectPostsByProduto = async function (id_produto) {
    try {
        console.log("AVISO: Campo id_produto não existe na tabela tbl_post");
        return [];
    } catch (error) {
        console.log("ERRO AO BUSCAR POSTS POR PRODUTO:", error);
        return [];
    }
};

// ================================ SELECT POSTS BY ESTABLISHMENT =================================
// FUNÇÃO DESABILITADA - Campo id_estabelecimento não existe na tabela tbl_post
const selectPostsByEstabelecimento = async function (id_estabelecimento) {
    try {
        console.log("AVISO: Campo id_estabelecimento não existe na tabela tbl_post");
        return [];
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
        // Usar queryRawUnsafe para INSERT e pegar o ID inserido
        let sql = `
            INSERT INTO tbl_comentario (id_post, id_usuario, conteudo)
            VALUES (${comentario.id_post}, ${comentario.id_usuario}, '${comentario.conteudo}')
        `;
        
        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            // Buscar o comentário criado usando LAST_INSERT_ID()
            let sqlSelect = `
                SELECT 
                    c.id_comentario,
                    c.id_post,
                    c.id_usuario,
                    c.conteudo,
                    c.data_criacao,
                    u.nome as nome_usuario
                FROM tbl_comentario c
                INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
                WHERE c.id_comentario = LAST_INSERT_ID()
            `;
            
            let comentarioCriado = await prisma.$queryRawUnsafe(sqlSelect);
            
            if (comentarioCriado && comentarioCriado.length > 0) {
                return comentarioCriado[0];
            }
            
            // Fallback: retornar objeto básico se não conseguir buscar
            return {
                id_post: comentario.id_post,
                id_usuario: comentario.id_usuario,
                conteudo: comentario.conteudo,
                nome_usuario: 'Usuário'
            };
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
        let rsPosts = await prisma.$queryRaw`
            SELECT 
                p.*,
                u.nome as nome_usuario,
                COUNT(DISTINCT c.id_comentario) as total_comentarios,
                COUNT(DISTINCT cu.id_curtida) as total_curtidas
            FROM tbl_post p
            INNER JOIN tbl_usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN tbl_comentario c ON p.id_post = c.id_post
            LEFT JOIN tbl_curtida cu ON p.id_post = cu.id_post
            GROUP BY p.id_post
            ORDER BY p.data_criacao DESC
            LIMIT ${limite}
        `;
        // Converter BigInt para Number
        const postsFormatados = rsPosts.map(post => ({
            ...post,
            total_comentarios: Number(post.total_comentarios),
            total_curtidas: Number(post.total_curtidas)
        }));
        return postsFormatados || [];
    } catch (error) {
        console.log("ERRO AO BUSCAR FEED:", error);
        return [];
    }
};

// ================================ UPDATE COMENTARIO =================================
const updateComentario = async function (comentario) {
    try {
        let sql = `
            UPDATE tbl_comentario SET
                conteudo = '${comentario.conteudo}'
            WHERE id_comentario = ${comentario.id_comentario}
        `;

        let result = await prisma.$executeRawUnsafe(sql);
        return result > 0;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR COMENTÁRIO:", error);
        return false;
    }
};

// ================================ DELETE COMENTARIO =================================
const deleteComentario = async function (id_comentario) {
    try {
        let sql = `DELETE FROM tbl_comentario WHERE id_comentario = ${id_comentario}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result > 0;
    } catch (error) {
        console.log("ERRO AO DELETAR COMENTÁRIO:", error);
        return false;
    }
};

// ================================ TOGGLE CURTIDA =================================
const toggleCurtida = async function (id_post, id_usuario) {
    try {
        // Verificar se já curtiu
        let sqlVerificar = `
            SELECT id_curtida FROM tbl_curtida 
            WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
        `;
        let curtidaExistente = await prisma.$queryRawUnsafe(sqlVerificar);

        if (curtidaExistente.length > 0) {
            // Remover curtida
            let sqlRemover = `
                DELETE FROM tbl_curtida 
                WHERE id_post = ${id_post} AND id_usuario = ${id_usuario}
            `;
            await prisma.$executeRawUnsafe(sqlRemover);
            return { curtido: false, acao: 'removida' };
        } else {
            // Adicionar curtida
            let sqlAdicionar = `
                INSERT INTO tbl_curtida (id_post, id_usuario) 
                VALUES (${id_post}, ${id_usuario})
            `;
            await prisma.$executeRawUnsafe(sqlAdicionar);
            return { curtido: true, acao: 'adicionada' };
        }
    } catch (error) {
        console.log("ERRO AO TOGGLE CURTIDA:", error);
        return false;
    }
};

// ================================ COUNT CURTIDAS =================================
const countCurtidasPost = async function (id_post) {
    try {
        let sql = `SELECT COUNT(*) as total FROM tbl_curtida WHERE id_post = ${id_post}`;
        let result = await prisma.$queryRawUnsafe(sql);
        return Number(result[0].total) || 0;
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
        return result.length > 0;
    } catch (error) {
        console.log("ERRO AO VERIFICAR CURTIDA:", error);
        return false;
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
    getFeedPosts,
    updateComentario,
    deleteComentario,
    toggleCurtida,
    countCurtidasPost,
    verificarCurtidaUsuario
};