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

// ==============================
// Rotas de Endereços de Usuário
// ==============================
const controllerEnderecoUsuario = require('../controller/enderecoUsuario/enderecoUsuarioController.js');

// Criar novo endereço de usuário (protegido)
router.post('/endereco-usuario', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerEnderecoUsuario.createEnderecoUsuario(dadosBody, contentType);

    console.log(resultado);
    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar endereço de usuário por ID (protegido)
router.put('/endereco-usuario/:id', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id = request.params.id;
    let dadosBody = request.body;

    dadosBody.id_endereco = id;
    let resultado = await controllerEnderecoUsuario.updateEnderecoUsuario(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar endereço de usuário por ID (protegido)
router.delete('/endereco-usuario/:id', verificarToken, async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerEnderecoUsuario.deleteEnderecoUsuario(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todos os endereços de usuário (protegido)
router.get('/enderecos-usuario', verificarToken, async (request, response) => {
    let resultado = await controllerEnderecoUsuario.getEnderecosUsuario();

    response.status(resultado.status_code || 200);
    response.json(resultado);
});

// Buscar endereço de usuário por ID (protegido)
router.get('/endereco-usuario/:id', verificarToken, async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerEnderecoUsuario.getEnderecoUsuarioById(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Buscar endereços por ID do usuário (protegido)
router.get('/usuario/:id/enderecos', verificarToken, async (request, response) => {
    let id_usuario = request.params.id;

    let resultado = await controllerEnderecoUsuario.getEnderecosByUsuarioId(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de Categorias
// ==============================
const controllerCategoria = require('../controller/categoria/categoriaController.js');

// Criar nova categoria (protegido)
router.post('/categoria', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerCategoria.createCategoria(dadosBody, contentType);

    console.log(resultado);
    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar categoria por ID (protegido)
router.put('/categoria/:id', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id = request.params.id;
    let dadosBody = request.body;

    dadosBody.id_categoria = id;
    let resultado = await controllerCategoria.updateCategoria(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar categoria por ID (protegido)
router.delete('/categoria/:id', verificarToken, async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerCategoria.deleteCategoria(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todas as categorias (público)
router.get('/categorias', async (request, response) => {
    let resultado = await controllerCategoria.getCategorias();

    response.status(resultado.status_code || 200);
    response.json(resultado);
});

// Buscar categoria por ID (público)
router.get('/categoria/:id', async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerCategoria.getCategoriaById(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todas as categorias com seus produtos (público)
router.get('/categorias-produtos', async (request, response) => {
    let resultado = await controllerCategoria.getCategoriasComProdutos();

    response.status(resultado.status_code || 200);
    response.json(resultado);
});

// Buscar categoria por ID com seus produtos (público)
router.get('/categoria-produtos/:id', async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerCategoria.getCategoriaComProdutosById(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de Produtos
// ==============================
const controllerProduto = require('../controller/produto/produtoController.js');

// Criar novo produto (protegido)
router.post('/produtos', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerProduto.createProduto(dadosBody, contentType);

    console.log(resultado);
    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar produto por ID (protegido)
router.put('/produto/:id', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id = request.params.id;
    let dadosBody = request.body;

    dadosBody.id_produto = id;
    let resultado = await controllerProduto.updateProduto(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar produto por ID (protegido)
router.delete('/produto/:id', verificarToken, async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerProduto.deleteProduto(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todos os produtos (público)
router.get('/produtos', async (request, response) => {
    let resultado = await controllerProduto.getProdutos();

    response.status(resultado.status_code || 200);
    response.json(resultado);
});

// Buscar produto por ID (público)
router.get('/produto/:id', async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerProduto.getProdutoById(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

module.exports = router;
