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
// Rotas de Chat / Promoções
// ==============================
const controllerChat = require('../controller/chatIA/controllerChatIa.js');

// Busca promoções (público ou autenticado conforme necessidade)
router.post('/chat/promocoes', bodyParserJson, verificarToken, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let termoBusca = dadosBody.termoBusca;
    let idUsuario = dadosBody.idUsuario;

    let resultado = await controllerChat.buscarPromocoes(termoBusca, idUsuario, contentType);

    console.log(resultado);
    response.status(resultado.status_code);
    response.json(resultado);
});

module.exports = router;
