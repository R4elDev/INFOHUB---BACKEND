const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const controllerUsuario = require('../controller/usuario/controllerUsuario.js');
const verificarToken = require('../middleware/verificarToken.js');

const bodyParserJson = bodyParser.json();

// ==============================
// Rotas de Usuário
// ==============================

// Cadastro de usuário (público)
router.post('/usuarios/cadastro', bodyParserJson, async (request, response) => {
  let contentType =  request.headers['content-type']
  let dadosBody = request.body

  let resultUsuario = await controllerUsuario.inserirUsuario(dadosBody, contentType)

  response.status(resultUsuario.status_code)
  response.json(resultUsuario)
});

// Login (público)
router.post('/login', bodyParserJson, async (request, response) => {
  let contentType = request.headers['content-type'];
  let { email, senha } = request.body;

  const result = await controllerUsuario.loginUsuario({ email, senha }, contentType);

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


module.exports = router;
