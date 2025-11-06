// Controller para integração com Groq e banco de dados
const { perguntarGroq } = require('../../services/groqService');
const Produto = require('../../model/DAO/produto'); // Exemplo usando Produto

// Exemplo: Recebe uma pergunta, busca produtos e envia para o LLM
async function interpretarPergunta(req, res) {
  try {
    const { pergunta } = req.body;
    // Busca produtos do banco (pode customizar para outro modelo)
    const produtos = await Produto.selectAllProdutos();
    const contexto = `Lista de produtos: ${JSON.stringify(produtos)}`;
    const resposta = await perguntarGroq(pergunta, contexto);
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { interpretarPergunta };
