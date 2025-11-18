// Controller para integração com IA híbrida e banco de dados
const { perguntarIA } = require('../../services/aiService');
const Produto = require('../../model/DAO/produto');
const Usuario = require('../../model/DAO/usuario');

// Função inteligente que busca dados relevantes baseado na pergunta
async function interpretarPergunta(req, res) {
  try {
    const { pergunta } = req.body;
    
    if (!pergunta) {
      return res.status(400).json({ erro: 'Pergunta é obrigatória' });
    }

    // Analisa a pergunta para determinar quais dados buscar
    const perguntaLower = pergunta.toLowerCase();
    let contexto = '';
    
    // Se pergunta sobre usuários
    if (perguntaLower.includes('usuario') || perguntaLower.includes('usuário') || 
        perguntaLower.includes('cadastrado') || perguntaLower.includes('cliente')) {
      
      const usuarios = await Usuario.selectAllUsuario();
      const totalUsuarios = usuarios ? usuarios.length : 0;
      
      // Dados resumidos dos usuários (otimizado para menos tokens)
      contexto += `\n=== DADOS DE USUÁRIOS ===\n`;
      contexto += `Total de usuários cadastrados: ${totalUsuarios}\n`;
      
      // Só incluir detalhes se for menos de 10 usuários
      if (totalUsuarios <= 10 && usuarios) {
        const usuariosResumo = usuarios.map(u => `${u.nome} (${u.perfil})`).join(', ');
        contexto += `Usuários: ${usuariosResumo}\n`;
      }
    }
    
    // Se pergunta sobre produtos
    if (perguntaLower.includes('produto') || perguntaLower.includes('promocao') || 
        perguntaLower.includes('promoção') || perguntaLower.includes('preco') || 
        perguntaLower.includes('preço')) {
      
      const produtos = await Produto.selectAllProdutos();
      const totalProdutos = produtos ? produtos.length : 0;
      
      contexto += `\n=== DADOS DE PRODUTOS ===\n`;
      contexto += `Total de produtos: ${totalProdutos}\n`;
      
      // Só incluir detalhes se for menos de 20 produtos
      if (totalProdutos <= 20 && produtos) {
        const produtosResumo = produtos.map(p => p.nome).join(', ');
        contexto += `Produtos: ${produtosResumo}\n`;
      }
    }
    
    // Se não encontrou contexto específico, busca dados gerais
    if (!contexto.trim()) {
      const usuarios = await Usuario.selectAllUsuario();
      const produtos = await Produto.selectAllProdutos();
      
      contexto = `\n=== RESUMO GERAL DO SISTEMA ===\n`;
      contexto += `Total de usuários: ${usuarios ? usuarios.length : 0}\n`;
      contexto += `Total de produtos: ${produtos ? produtos.length : 0}\n`;
    }

    const resultado = await perguntarIA(pergunta, contexto);
    res.json({ 
      resposta: resultado.resposta,
      fonte: resultado.fonte,
      tempo_resposta: resultado.tempo_resposta
    });
    
  } catch (err) {
    console.error('Erro no groqController:', err);
    res.status(503).json({ 
      erro: 'Serviço de IA temporariamente indisponível',
      detalhes: err.message,
      status: 'Groq API não respondeu'
    });
  }
}

module.exports = { interpretarPergunta };
