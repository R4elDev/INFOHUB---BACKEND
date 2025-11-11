/*****************************************************************************************
 * Objetivo --> Model responsavel pelo CRUD de dados referente a usuario no BANCO DE DADOS
 * Data --> 18/09/2025
 * Autor --> Israel
 ****************************************************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================ INSERT =================================
const insertUsuario = async function (usuario) {
    try {
        console.log(usuario)
        let sql = `
            INSERT INTO tbl_usuario (
                nome, email, senha_hash, perfil, cpf, cnpj, data_nascimento, telefone
            ) VALUES (
                '${usuario.nome}',
                '${usuario.email}',
                '${usuario.senha_hash}',
                '${usuario.perfil}',
                ${usuario.cpf ? `'${usuario.cpf}'` : 'NULL'},
                ${usuario.cnpj ? `'${usuario.cnpj}'` : 'NULL'},
                '${usuario.data_nascimento}',
                ${usuario.telefone ? `'${usuario.telefone}'` : 'NULL'}
            );
        `;

        let result = await prisma.$executeRawUnsafe(sql);

        if (result) {
            let sqlSelect = `
                SELECT * 
                FROM tbl_usuario 
                WHERE email = '${usuario.email}' 
                ORDER BY id_usuario DESC 
                LIMIT 1;
            `;
            let usuarioCriado = await prisma.$queryRawUnsafe(sqlSelect);
            return usuarioCriado[0];
        } else {
            return false;
        }
    } catch (error) {
        console.log("ERRO AO INSERIR USUARIO:", error);
        return false;
    }
};

// ================================ UPDATE =================================
const updateUsuario = async function (usuario) {
    try {
        // Construir campos para atualização dinamicamente
        let camposUpdate = [];

        // Adicionar apenas campos que foram realmente enviados
        if (usuario.nome !== undefined) {
            camposUpdate.push(`nome = '${usuario.nome}'`);
        }
        
        if (usuario.email !== undefined) {
            camposUpdate.push(`email = '${usuario.email}'`);
        }
        
        if (usuario.senha_hash !== undefined) {
            camposUpdate.push(`senha_hash = '${usuario.senha_hash}'`);
        }
        
        if (usuario.perfil !== undefined) {
            camposUpdate.push(`perfil = '${usuario.perfil}'`);
        }
        
        if (usuario.cpf !== undefined) {
            camposUpdate.push(`cpf = ${usuario.cpf ? `'${usuario.cpf}'` : 'NULL'}`);
        }
        
        if (usuario.cnpj !== undefined) {
            camposUpdate.push(`cnpj = ${usuario.cnpj ? `'${usuario.cnpj}'` : 'NULL'}`);
        }
        
        if (usuario.telefone !== undefined) {
            camposUpdate.push(`telefone = ${usuario.telefone ? `'${usuario.telefone}'` : 'NULL'}`);
        }
        
        if (usuario.data_nascimento !== undefined) {
            camposUpdate.push(`data_nascimento = ${usuario.data_nascimento ? `'${usuario.data_nascimento}'` : 'NULL'}`);
        }

        // Verificar se há campos para atualizar
        if (camposUpdate.length === 0) {
            console.log("Nenhum campo para atualizar");
            return false;
        }

        // Montar SQL final apenas com campos enviados
        let sql = `
            UPDATE tbl_usuario SET
                ${camposUpdate.join(', ')}
            WHERE id_usuario = ${usuario.id_usuario};
        `;

        console.log("SQL de atualização:", sql);
        
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO ATUALIZAR USUARIO:", error);
        return false;
    }
};


// ================================ DELETE =================================
const deleteUsuario = async function (id) {
    try {
        let sql = `DELETE FROM tbl_usuario WHERE id_usuario = ${id}`;
        let result = await prisma.$executeRawUnsafe(sql);
        return result ? true : false;
    } catch (error) {
        console.log("ERRO AO DELETAR USUARIO:", error);
        return false;
    }
};

// ================================ SELECT ALL =================================
const selectAllUsuario = async function () {
    try {
        let sql = `SELECT * FROM tbl_usuario`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result : false;
    } catch (error) {
        console.log("ERRO AO LISTAR USUARIOS:", error);
        return false;
    }
};

// ================================ SELECT BY ID =================================
const selectByIdUsuario = async function (id) {
    try {
        let sql = `SELECT * FROM tbl_usuario WHERE id_usuario = ${id}`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR USUARIO POR ID:", error);
        return false;
    }
};

// ================================ SELECT BY EMAIL =================================
const selectByEmailUsuario = async function (email) {
    try {
        let sql = `SELECT * FROM tbl_usuario WHERE email = '${email}'`;
        let result = await prisma.$queryRawUnsafe(sql);
        return result && result.length > 0 ? result[0] : false;
    } catch (error) {
        console.log("ERRO AO BUSCAR USUARIO POR EMAIL:", error);
        return false;
    }
};


// usuarioDAO.js
const updateSenha = async (idUsuario, senha_hash) => {
  try {
    const sql = `
      UPDATE tbl_usuario
      SET senha_hash = '${senha_hash}'
      WHERE id_usuario = ${idUsuario}
    ;`

    const result = await prisma.$executeRawUnsafe(sql)

    return result ? true : false;
  } catch (error) {
    console.log('ERRO UPDATE SENHA ->', error);
    return false;
  }
};


// ================================ EXPORTS =================================
module.exports = {
    insertUsuario,
    updateUsuario,
    deleteUsuario,
    selectAllUsuario,
    selectByIdUsuario,
    selectByEmailUsuario,
    updateSenha
};
