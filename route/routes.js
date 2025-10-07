const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const verificarToken = require('../middleware/verificarToken.js');

const bodyParserJson = bodyParser.json();

// ==============================
// Rotas de Usuário
// ==============================
const controllerUsuario = require('../controller/usuario/controllerUsuario.js');


// Cadastro de usuário (público)
router.post('/usuarios/cadastro', bodyParserJson, async (request, response) => {
  let contentType =  request.headers['content-type']
  let dadosBody = request.body

  let resultUsuario = await controllerUsuario.inserirUsuario(dadosBody, contentType)


  console.log(resultUsuario)
  response.status(resultUsuario.status_code)
  response.json(resultUsuario)
});

// Login (público)
router.post('/login', bodyParserJson, async (request, response) => {
  let contentType = request.headers['content-type'];
  let { email, senha } = request.body;

  const result = await controllerUsuario.loginUsuario({ email, senha }, contentType);

  console.log('Resultado loginUsuario:', result)

  response.status(result.status_code || 200).json(result);
});

// Listar todos os usuários (protegido)
router.get('/usuarios', verificarToken, async (request, response) => {

  const result = await controllerUsuario.listarUsuarios();
  response.status(result.status_code || 200).json(result);
});

// Listar apenas um usuario por id
router.get('/usuario/:id',verificarToken,async (request, response) => {
    let id = request.params.id

    let resultUsuario = await controllerUsuario.buscarUsuarioId(id)

    response.status(resultUsuario.status_code)
    response.json(resultUsuario)
});

// Deletar um usuario por id

router.delete('/usuario/:id',verificarToken,async (request, response) => {
    let id = request.params.id

    let resultUsuario = await controllerUsuario.excluirUsuario(id)

    response.status(resultUsuario.status_code)
    response.json(resultUsuario)

});

// Atualizar um usuario por id 
router.put('/usuario/:id',verificarToken,bodyParserJson,async (request, response) => {
    let contentType = request.headers['content-type']
    let id = request.params.id
    let dadosBody = request.body

    let resultUsuario = await controllerUsuario.atualizarUsuario(dadosBody,id,contentType)

    response.status(resultUsuario.status_code)
    response.json(resultUsuario)
});


// ==============================
// Rotas de Recuperaçao de senha
// ==============================
const controllerRecuperacaoSenha = require('../controller/recuperarSenha/controllerRecuperarSenha.js');

// Solicitar recuperaçao de senha ( pública )
router.post('/recuperar-senha', bodyParserJson, async (request, response) => {
  let contentType = request.headers['content-type']
  let dadosBody = request.body

  let resultRecuperacao = await controllerRecuperacaoSenha.solicitarRecuperacao(dadosBody,contentType)

  response.status(resultRecuperacao.status_code || 200)
  response.json(resultRecuperacao)
})


// Valida código de recuperação (público)
router.post('/validar-codigo', bodyParserJson, async(request,response) => {
  let contentType = request.headers['content-type']
  let dadosBody = request.body

  let resultValidacao = await controllerRecuperacaoSenha.validarCodigo(dadosBody,contentType)

  response.status(resultValidacao.status_code || 200);
  response.json(resultValidacao);
})


router.post('/redefinir-senha', bodyParserJson, async (request,response) => {
  let contentType = request.headers['content-type']
  let dadosBody = request.body

  let resultRedefinir = await controllerRecuperacaoSenha.redefinirSenha(dadosBody,contentType)

  response.status(resultRedefinir.status_code || 200);
  response.json(resultRedefinir);

})




// ==============================
// Rotas de CHAT COM IA
// ==============================

// Controller responsável pela busca de promoções via IA
const controllerChat = require('../controller/chatIA/agenteController.js');

// Busca promoções (público ou autenticado conforme necessidade)
router.post('/interagir', bodyParserJson, verificarToken, async (request, response) => {
    try {
        let contentType = request.headers['content-type'];
        let dadosBody = request.body;

        let mensagem = dadosBody.mensagem;
        let idUsuario = dadosBody.idUsuario;

        if (!mensagem || !idUsuario) {
            return response.status(400).json({
                status: false,
                status_code: 400,
                message: "Campos 'mensagem' e 'idUsuario' são obrigatórios."
            });
        }

        let resultado = await controllerChat.buscarPromocoes(mensagem, idUsuario, contentType);

        console.log("Resultado da busca:", resultado);

        return response.status(resultado.status_code).json(resultado);
    } catch (error) {
        console.error("Erro na rota /interagir:", error);
        return response.status(500).json({
            status: false,
            status_code: 500,
            message: "Erro interno no servidor."
        });
    }
});

router.post('/respostaOllama', bodyParserJson, verificarToken, async (request, response) => {
  let contentType = request.headers['content-type'];
  let dadosBody = request.body;

  let usuarioId = dadosBody.idUsuario;
  let mensagem = dadosBody.mensagem;

  let resultado = await controllerChat.respostaOllama(mensagem, usuarioId, contentType);

  console.log(resultado);
  response.status(resultado.status_code);
  response.json(resultado);
});

module.exports = router;
