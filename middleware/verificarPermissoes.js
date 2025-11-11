/*****************************************************************************************
 * Objetivo --> Middleware para verificar permissões de administrador
 * Data --> 11/11/2025
 * Autor --> InfoHub Team
 *****************************************************************************************/

const jwt = require("jsonwebtoken");

/**
 * MIDDLEWARE PARA VERIFICAR SE O USUÁRIO É ADMINISTRADOR
 */
const verificarAdmin = async (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token de autenticação é obrigatório."
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token inválido."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.perfil || decoded.perfil !== 'admin') {
            return response.status(403).json({
                status: false,
                status_code: 403,
                message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade."
            });
        }

        // Adicionar dados do usuário ao request
        request.user = decoded;
        next();

    } catch (error) {
        console.log("ERRO NO MIDDLEWARE ADMIN:", error);
        return response.status(401).json({
            status: false,
            status_code: 401,
            message: "Token inválido ou expirado."
        });
    }
};

/**
 * MIDDLEWARE PARA VERIFICAR SE O USUÁRIO É ADMIN OU ESTABELECIMENTO
 */
const verificarAdminOuEstabelecimento = async (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token de autenticação é obrigatório."
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token inválido."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.perfil || (decoded.perfil !== 'admin' && decoded.perfil !== 'estabelecimento')) {
            return response.status(403).json({
                status: false,
                status_code: 403,
                message: "Acesso negado. Apenas administradores ou estabelecimentos podem acessar esta funcionalidade."
            });
        }

        request.user = decoded;
        next();

    } catch (error) {
        console.log("ERRO NO MIDDLEWARE ADMIN/ESTABELECIMENTO:", error);
        return response.status(401).json({
            status: false,
            status_code: 401,
            message: "Token inválido ou expirado."
        });
    }
};

/**
 * MIDDLEWARE PARA VERIFICAR SE O USUÁRIO PODE ACESSAR SEUS PRÓPRIOS DADOS
 */
const verificarProprietarioOuAdmin = async (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token de autenticação é obrigatório."
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: "Token inválido."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Pegar ID do usuário da URL ou do body
        const idUsuarioRota = request.params.id_usuario || request.params.id || request.body.id_usuario;

        // Admin pode acessar dados de qualquer usuário
        if (decoded.perfil === 'admin') {
            request.user = decoded;
            return next();
        }

        // Usuário comum só pode acessar seus próprios dados
        if (decoded.id == idUsuarioRota) {
            request.user = decoded;
            return next();
        }

        return response.status(403).json({
            status: false,
            status_code: 403,
            message: "Acesso negado. Você só pode acessar seus próprios dados."
        });

    } catch (error) {
        console.log("ERRO NO MIDDLEWARE PROPRIETÁRIO/ADMIN:", error);
        return response.status(401).json({
            status: false,
            status_code: 401,
            message: "Token inválido ou expirado."
        });
    }
};

/**
 * MIDDLEWARE PARA EXTRAIR PERFIL DO USUÁRIO
 */
const extrairPerfilUsuario = async (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    request.user = decoded;
                } catch (error) {
                    // Token inválido, mas não bloqueia a requisição
                    request.user = null;
                }
            }
        }

        next();

    } catch (error) {
        console.log("ERRO NO MIDDLEWARE EXTRAIR PERFIL:", error);
        next();
    }
};

module.exports = {
    verificarAdmin,
    verificarAdminOuEstabelecimento,
    verificarProprietarioOuAdmin,
    extrairPerfilUsuario
};