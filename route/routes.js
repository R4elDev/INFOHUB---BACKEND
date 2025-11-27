const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const verificarToken = require('../middleware/verificarToken.js');
const { verificarAdmin, verificarAdminOuEstabelecimento, verificarProprietarioOuAdmin } = require('../middleware/verificarPermissoes.js');

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
const controllerGroq = require('../controller/chatIA/groqController.js');

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

// Nova rota para integração com Groq
router.post('/groq', bodyParserJson, async (req, res) => {
  await controllerGroq.interpretarPergunta(req, res);
});

// Endpoint de chat com IA Groq (público ou autenticado)
router.post('/chat-groq', bodyParserJson, async (req, res) => {
  /*
    Espera body:
    {
      "pergunta": "sua pergunta aqui"
    }
    Retorna:
    {
      "resposta": "resposta interpretada pelo LLM"
    }
  */
  await controllerGroq.interpretarPergunta(req, res);
});

// ==============================
// Rotas de Estabelecimentos
// ==============================
const controllerEstabelecimento = require('../controller/estabelecimento/estabelecimentoController.js');

// Criar novo estabelecimento (protegido)
router.post('/estabelecimento', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerEstabelecimento.createEstabelecimento(dadosBody, contentType);

    console.log(resultado);
    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar estabelecimento por ID (protegido)
router.put('/estabelecimento/:id', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id = request.params.id;
    let dadosBody = request.body;

    dadosBody.id_estabelecimento = id;
    let resultado = await controllerEstabelecimento.updateEstabelecimento(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar estabelecimento por ID (protegido)
router.delete('/estabelecimento/:id', verificarToken, async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerEstabelecimento.deleteEstabelecimento(id);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todos os estabelecimentos (público)
router.get('/estabelecimentos', async (request, response) => {
    let resultado = await controllerEstabelecimento.getEstabelecimentos();

    response.status(resultado.status_code || 200);
    response.json(resultado);
});

// Buscar estabelecimento por ID (público)
router.get('/estabelecimento/:id', async (request, response) => {
    let id = request.params.id;

    let resultado = await controllerEstabelecimento.getEstabelecimentoById(id);

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

// ==============================
// Rotas de CARRINHO DE COMPRAS
// ==============================
const controllerCarrinho = require('../controller/carrinho/carrinhoController.js');

// Adicionar item ao carrinho (protegido)
router.post('/carrinho', verificarToken, bodyParserJson, async (request, response) => {
    try {
        let contentType = request.headers['content-type'];
        let dadosBody = request.body;

        let resultado = await controllerCarrinho.adicionarItemCarrinho(dadosBody, contentType);

        if (resultado && resultado.status_code) {
            response.status(resultado.status_code);
            response.json(resultado);
        } else {
            response.status(500);
            response.json({
                status: false,
                status_code: 500,
                message: "Erro interno do servidor"
            });
        }
    } catch (error) {
        console.log("ERRO NA ROTA CARRINHO:", error);
        response.status(500);
        response.json({
            status: false,
            status_code: 500,
            message: "Erro interno do servidor"
        });
    }
});

// Listar carrinho do usuário (próprio usuário ou admin)
router.get('/carrinho/:id_usuario', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerCarrinho.listarCarrinhoUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar quantidade do item no carrinho (protegido)
router.put('/carrinho', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerCarrinho.atualizarItemCarrinho(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Remover item do carrinho (próprio usuário ou admin)
router.delete('/carrinho/:id_usuario/:id_produto', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let id_produto = request.params.id_produto;

    let resultado = await controllerCarrinho.removerItemCarrinho(id_usuario, id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Limpar carrinho do usuário (próprio usuário ou admin)
router.delete('/carrinho/:id_usuario', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerCarrinho.limparCarrinhoUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Contar itens no carrinho (próprio usuário ou admin)
router.get('/carrinho/:id_usuario/count', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerCarrinho.contarItensCarrinho(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Calcular total do carrinho (próprio usuário ou admin)
router.get('/carrinho/:id_usuario/total', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerCarrinho.calcularTotalCarrinho(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de COMPRAS
// ==============================
const controllerCompra = require('../controller/compra/compraController.js');

// Processar compra do carrinho (protegido)
router.post('/compra/carrinho', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerCompra.processarCompraCarrinho(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Criar compra manual (admin)
router.post('/compra', verificarAdmin, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerCompra.criarCompra(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar compras do usuário (próprio usuário ou admin)
router.get('/compras/usuario/:id_usuario', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerCompra.listarComprasUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Buscar compra por ID (protegido com verificação de proprietário)
router.get('/compra/:id_compra', verificarToken, async (request, response) => {
    let id_compra = request.params.id_compra;

    let resultado = await controllerCompra.buscarCompraPorId(id_compra);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todas as compras (admin ou estabelecimento)
router.get('/compras', verificarAdminOuEstabelecimento, async (request, response) => {
    let resultado = await controllerCompra.listarTodasCompras();

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar compras por status (admin ou estabelecimento)
router.get('/compras/status/:status', verificarAdminOuEstabelecimento, async (request, response) => {
    let status = request.params.status;

    let resultado = await controllerCompra.listarComprasPorStatus(status);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar status da compra (admin ou estabelecimento)
router.put('/compra/:id_compra/status', verificarAdminOuEstabelecimento, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_compra = request.params.id_compra;
    let { status } = request.body;

    let resultado = await controllerCompra.atualizarStatusCompra(id_compra, status, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Cancelar compra (protegido)
router.put('/compra/:id_compra/cancelar', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_compra = request.params.id_compra;

    let resultado = await controllerCompra.cancelarCompra(id_compra, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de FAVORITOS
// ==============================
const controllerFavorito = require('../controller/favorito/favoritoController.js');

// Adicionar produto aos favoritos (protegido)
router.post('/favoritos', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerFavorito.adicionarFavorito(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar favoritos do usuário (protegido)
router.get('/favoritos/:id_usuario', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerFavorito.listarFavoritosUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Alternar favorito (adiciona/remove) (protegido)
router.post('/favoritos/toggle', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerFavorito.alternarFavorito(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Remover produto dos favoritos (protegido)
router.delete('/favoritos/:id_usuario/:id_produto', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let id_produto = request.params.id_produto;

    let resultado = await controllerFavorito.removerFavorito(id_usuario, id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar se produto é favorito (protegido)
router.get('/favoritos/:id_usuario/:id_produto/check', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let id_produto = request.params.id_produto;

    let resultado = await controllerFavorito.verificarFavorito(id_usuario, id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar favoritos em promoção (protegido)
router.get('/favoritos/:id_usuario/promocoes', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerFavorito.listarFavoritosEmPromocao(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Produtos mais favoritados (público)
router.get('/favoritos/mais-favoritados/:limit', async (request, response) => {
    let limit = request.params.limit;

    let resultado = await controllerFavorito.listarProdutosMaisFavoritados(limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Produtos mais favoritados sem limit (público)
router.get('/favoritos/mais-favoritados', async (request, response) => {
    let resultado = await controllerFavorito.listarProdutosMaisFavoritados();

    response.status(resultado.status_code);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Contar favoritos do usuário (protegido)
router.get('/favoritos/:id_usuario/count', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerFavorito.contarFavoritosUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de NOTIFICAÇÕES
// ==============================
const controllerNotificacao = require('../controller/notificacao/notificacaoController.js');

// Criar notificação (admin)
router.post('/notificacoes', verificarAdmin, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerNotificacao.criarNotificacao(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar notificações do usuário (próprio usuário ou admin)
router.get('/notificacoes/:id_usuario', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let limit = request.query.limit;

    let resultado = await controllerNotificacao.listarNotificacoesUsuario(id_usuario, limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar notificações não lidas (próprio usuário ou admin)
router.get('/notificacoes/:id_usuario/nao-lidas', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerNotificacao.listarNotificacoesNaoLidas(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Contar notificações não lidas (próprio usuário ou admin)
router.get('/notificacoes/:id_usuario/count', verificarProprietarioOuAdmin, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerNotificacao.contarNotificacoesNaoLidas(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Marcar notificação como lida (protegido)
router.put('/notificacoes/:id_notificacao/lida', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_notificacao = request.params.id_notificacao;

    let resultado = await controllerNotificacao.marcarComoLida(id_notificacao, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Marcar todas as notificações como lidas (protegido)
router.put('/notificacoes/:id_usuario/marcar-todas-lidas', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerNotificacao.marcarTodasComoLidas(id_usuario, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar notificação (protegido)
router.delete('/notificacoes/:id_notificacao', verificarToken, async (request, response) => {
    let id_notificacao = request.params.id_notificacao;

    let resultado = await controllerNotificacao.deletarNotificacao(id_notificacao);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar notificações por tipo (protegido)
router.get('/notificacoes/:id_usuario/tipo/:tipo', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let tipo = request.params.tipo;

    let resultado = await controllerNotificacao.listarNotificacoesPorTipo(id_usuario, tipo);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de AVALIAÇÕES
// ==============================
const controllerAvaliacao = require('../controller/avaliacao/avaliacaoController.js');

// Criar avaliação (protegido)
router.post('/avaliacoes', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerAvaliacao.criarAvaliacao(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar avaliações de produto (público)
router.get('/avaliacoes/produto/:id_produto', async (request, response) => {
    let id_produto = request.params.id_produto;

    let resultado = await controllerAvaliacao.listarAvaliacoesProduto(id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar avaliações de estabelecimento (público)
router.get('/avaliacoes/estabelecimento/:id_estabelecimento', async (request, response) => {
    let id_estabelecimento = request.params.id_estabelecimento;

    let resultado = await controllerAvaliacao.listarAvaliacoesEstabelecimento(id_estabelecimento);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar avaliações do usuário (protegido)
router.get('/avaliacoes/usuario/:id_usuario', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerAvaliacao.listarAvaliacoesUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar avaliação (protegido)
router.put('/avaliacoes/:id_avaliacao', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_avaliacao = request.params.id_avaliacao;
    let dadosBody = request.body;
    dadosBody.id_avaliacao = id_avaliacao;

    let resultado = await controllerAvaliacao.atualizarAvaliacao(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar avaliação (protegido)
router.delete('/avaliacoes/:id_avaliacao', verificarToken, async (request, response) => {
    let id_avaliacao = request.params.id_avaliacao;

    let resultado = await controllerAvaliacao.deletarAvaliacao(id_avaliacao);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Obter estatísticas de produto (público)
router.get('/avaliacoes/produto/:id_produto/estatisticas', async (request, response) => {
    let id_produto = request.params.id_produto;

    let resultado = await controllerAvaliacao.obterEstatisticasProduto(id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Obter estatísticas de estabelecimento (público)
router.get('/avaliacoes/estabelecimento/:id_estabelecimento/estatisticas', async (request, response) => {
    let id_estabelecimento = request.params.id_estabelecimento;

    let resultado = await controllerAvaliacao.obterEstatisticasEstabelecimento(id_estabelecimento);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Produtos mais bem avaliados (público)
router.get('/avaliacoes/produtos/mais-bem-avaliados/:limit', async (request, response) => {
    let limit = request.params.limit;

    let resultado = await controllerAvaliacao.listarProdutosMaisBemAvaliados(limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Produtos mais bem avaliados sem limit (público)
router.get('/avaliacoes/produtos/mais-bem-avaliados', async (request, response) => {
    let resultado = await controllerAvaliacao.listarProdutosMaisBemAvaliados();

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar se usuário pode avaliar produto e estabelecimento (protegido)
router.get('/avaliacoes/pode-avaliar/:id_usuario/:id_produto/:id_estabelecimento', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let id_produto = request.params.id_produto;
    let id_estabelecimento = request.params.id_estabelecimento;

    let resultado = await controllerAvaliacao.verificarPodeAvaliar(id_usuario, id_produto, id_estabelecimento);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar se usuário pode avaliar produto (protegido)
router.get('/avaliacoes/pode-avaliar/:id_usuario/:id_produto', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let id_produto = request.params.id_produto;

    let resultado = await controllerAvaliacao.verificarPodeAvaliar(id_usuario, id_produto, null);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar se usuário pode avaliar estabelecimento (protegido)
router.get('/avaliacoes/pode-avaliar/:id_usuario', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerAvaliacao.verificarPodeAvaliar(id_usuario, null, null);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de PROMOÇÕES
// ==============================
const controllerPromocao = require('../controller/promocao/promocaoController.js');

// Criar promoção (admin ou estabelecimento)
router.post('/promocoes', verificarAdminOuEstabelecimento, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;

    let resultado = await controllerPromocao.criarPromocao(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar promoções ativas (público)
router.get('/promocoes', async (request, response) => {
    let resultado = await controllerPromocao.listarPromocoesAtivas();

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar melhores promoções (público)
router.get('/promocoes/melhores/:limit', async (request, response) => {
    let limit = request.params.limit;

    let resultado = await controllerPromocao.listarMelhoresPromocoes(limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar melhores promoções sem limit (público)
router.get('/promocoes/melhores', async (request, response) => {
    let resultado = await controllerPromocao.listarMelhoresPromocoes();

    response.status(resultado.status_code);
    response.json(resultado);
});

// Buscar promoção por ID (público)
router.get('/promocao/:id_promocao', async (request, response) => {
    let id_promocao = request.params.id_promocao;

    let resultado = await controllerPromocao.buscarPromocaoPorId(id_promocao);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar promoções de produto (público)
router.get('/promocoes/produto/:id_produto', async (request, response) => {
    let id_produto = request.params.id_produto;

    let resultado = await controllerPromocao.listarPromocoesProduto(id_produto);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar promoções de estabelecimento (público)
router.get('/promocoes/estabelecimento/:id_estabelecimento', async (request, response) => {
    let id_estabelecimento = request.params.id_estabelecimento;

    let resultado = await controllerPromocao.listarPromocoesEstabelecimento(id_estabelecimento);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar se produto está em promoção (público)
router.get('/promocoes/verificar/:id_produto/:id_estabelecimento', async (request, response) => {
    let id_produto = request.params.id_produto;
    let id_estabelecimento = request.params.id_estabelecimento;

    let resultado = await controllerPromocao.verificarPromocaoProduto(id_produto, id_estabelecimento);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar promoção (admin ou estabelecimento)
router.put('/promocao/:id_promocao', verificarAdminOuEstabelecimento, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_promocao = request.params.id_promocao;
    let dadosBody = request.body;
    dadosBody.id_promocao = id_promocao;

    let resultado = await controllerPromocao.atualizarPromocao(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar promoção (admin ou estabelecimento)
router.delete('/promocao/:id_promocao', verificarAdminOuEstabelecimento, async (request, response) => {
    let id_promocao = request.params.id_promocao;

    let resultado = await controllerPromocao.deletarPromocao(id_promocao);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todas as promoções (admin)
router.get('/promocoes/admin/todas', verificarAdmin, async (request, response) => {
    let resultado = await controllerPromocao.listarTodasPromocoes();

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de REDE SOCIAL (POSTS)
// ==============================
const controllerPost = require('../controller/post/postController.js');

// Criar post (protegido)
router.post('/posts', verificarToken, bodyParserJson, async (request, response) => {
    try {
        let contentType = request.headers['content-type'];
        let dadosBody = request.body;

        let resultado = await controllerPost.criarPost(dadosBody, contentType);

        if (resultado && resultado.status_code) {
            response.status(resultado.status_code);
            response.json(resultado);
        } else {
            response.status(500);
            response.json({
                status: false,
                status_code: 500,
                message: "Erro interno do servidor ao criar post"
            });
        }
    } catch (error) {
        console.log("ERRO NA ROTA CRIAR POST:", error);
        response.status(500);
        response.json({
            status: false,
            status_code: 500,
            message: "Erro interno do servidor"
        });
    }
});

// Listar posts do feed (protegido)
router.get('/posts/feed/:page/:limit', verificarToken, async (request, response) => {
    let page = request.params.page;
    let limit = request.params.limit;

    let resultado = await controllerPost.listarFeed(page, limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar todos os posts (protegido)
router.get('/posts', verificarToken, async (request, response) => {
    try {
        let limit = request.query.limit || 50; // Limite padrão de 50 posts
        let resultado = await controllerPost.listarTodosPosts(limit);

        response.status(resultado.status_code);
        response.json(resultado);
    } catch (error) {
        console.log("ERRO NA ROTA LISTAR TODOS OS POSTS:", error);
        response.status(500);
        response.json({
            status: false,
            status_code: 500,
            message: "Erro interno do servidor"
        });
    }
});

// Listar posts do feed sem paginação (protegido)
router.get('/posts/feed', verificarToken, async (request, response) => {
    let resultado = await controllerPost.listarFeed();

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar posts de um usuário (protegido)
router.get('/posts/usuario/:id_usuario/:page/:limit', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;
    let page = request.params.page;
    let limit = request.params.limit;

    let resultado = await controllerPost.listarPostsUsuario(id_usuario, page, limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar posts de um usuário sem paginação (protegido)
router.get('/posts/usuario/:id_usuario', verificarToken, async (request, response) => {
    let id_usuario = request.params.id_usuario;

    let resultado = await controllerPost.listarPostsUsuario(id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Buscar post por ID (protegido)
router.get('/post/:id_post', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;

    let resultado = await controllerPost.buscarPostPorId(id_post);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar post (protegido)
router.put('/post/:id_post', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_post = request.params.id_post;
    let dadosBody = request.body;
    dadosBody.id_post = id_post;

    let resultado = await controllerPost.atualizarPost(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar post (protegido)
router.delete('/post/:id_post', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;

    let resultado = await controllerPost.deletarPost(id_post);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Curtir/Descurtir post (protegido)
router.post('/post/:id_post/curtir', verificarToken, bodyParserJson, async (request, response) => {
    let id_post = request.params.id_post;
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;
    dadosBody.id_post = id_post;

    let id_usuario = dadosBody.id_usuario;

    let resultado = await controllerPost.toggleCurtidaPost(id_post, id_usuario, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Verificar curtida do usuário (protegido)
router.get('/post/:id_post/curtida/verificar', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;
    let id_usuario = request.query.id_usuario;

    let resultado = await controllerPost.verificarCurtidaUsuario(id_post, id_usuario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Comentar post (protegido)
router.post('/post/:id_post/comentario', verificarToken, bodyParserJson, async (request, response) => {
    let id_post = request.params.id_post;
    let contentType = request.headers['content-type'];
    let dadosBody = request.body;
    dadosBody.id_post = id_post;

    let resultado = await controllerPost.comentarPost(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar comentários de um post (protegido)
router.get('/post/:id_post/comentarios/:page/:limit', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;
    let page = request.params.page;
    let limit = request.params.limit;

    let resultado = await controllerPost.listarComentarios(id_post, page, limit);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Listar comentários de um post sem paginação (protegido)
router.get('/post/:id_post/comentarios', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;

    let resultado = await controllerPost.listarComentarios(id_post);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Deletar comentário (protegido)
router.delete('/comentario/:id_comentario', verificarToken, async (request, response) => {
    let id_comentario = request.params.id_comentario;

    let resultado = await controllerPost.deletarComentario(id_comentario);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Atualizar comentário (protegido)
router.put('/comentario/:id_comentario', verificarToken, bodyParserJson, async (request, response) => {
    let contentType = request.headers['content-type'];
    let id_comentario = request.params.id_comentario;
    let dadosBody = request.body;
    dadosBody.id_comentario = id_comentario;

    let resultado = await controllerPost.atualizarComentario(dadosBody, contentType);

    response.status(resultado.status_code);
    response.json(resultado);
});

// Obter estatísticas do post (curtidas e comentários)
router.get('/post/:id_post/estatisticas', verificarToken, async (request, response) => {
    let id_post = request.params.id_post;

    let resultado = await controllerPost.obterEstatisticasPost(id_post);

    response.status(resultado.status_code);
    response.json(resultado);
});

// ==============================
// Rotas de INFOCASH - SISTEMA DE PONTOS
// ==============================
const controllerInfocash = require('../controller/infocash/infocashController.js');

// Buscar saldo atual do usuário (próprio usuário ou admin)
router.get('/infocash/saldo/:id', verificarProprietarioOuAdmin, async (request, response) => {
    await controllerInfocash.getSaldo(request, response);
});

// Buscar histórico de transações do usuário (próprio usuário ou admin)
router.get('/infocash/historico/:id', verificarProprietarioOuAdmin, async (request, response) => {
    await controllerInfocash.getHistorico(request, response);
});

// Buscar resumo de pontos por tipo de ação (próprio usuário ou admin)
router.get('/infocash/resumo/:id', verificarProprietarioOuAdmin, async (request, response) => {
    await controllerInfocash.getResumo(request, response);
});

// Buscar informações completas do usuário - saldo + resumo (próprio usuário ou admin)
router.get('/infocash/perfil/:id', verificarProprietarioOuAdmin, async (request, response) => {
    await controllerInfocash.getPerfilCompleto(request, response);
});

// Buscar transações por período (próprio usuário ou admin)
router.get('/infocash/periodo/:id', verificarProprietarioOuAdmin, async (request, response) => {
    await controllerInfocash.getTransacoesPorPeriodo(request, response);
});

// Conceder pontos manualmente (apenas admin)
router.post('/infocash/conceder', verificarAdmin, bodyParserJson, async (request, response) => {
    await controllerInfocash.concederPontos(request, response);
});

// Buscar ranking de usuários com mais pontos (protegido)
router.get('/infocash/ranking', verificarToken, async (request, response) => {
    await controllerInfocash.getRanking(request, response);
});

// Buscar estatísticas gerais do sistema (apenas admin)
router.get('/infocash/estatisticas', verificarAdmin, async (request, response) => {
    await controllerInfocash.getEstatisticas(request, response);
});

module.exports = router;
