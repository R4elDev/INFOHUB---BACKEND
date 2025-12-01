// Controller para integração com IA híbrida e banco de dados
const { perguntarIA } = require('../../services/aiService');
const Produto = require('../../model/DAO/produto');
const Usuario = require('../../model/DAO/usuario');

// Função para formatar data no padrão brasileiro
function formatarData(data) {
  if (!data) return '';
  
  const date = new Date(data);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

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
    
    // Buscar produtos (sempre que houver pergunta relacionada ou para contexto geral)
    const buscarProdutos = perguntaLower.includes('produto') || 
                           perguntaLower.includes('promocao') || 
                           perguntaLower.includes('promoção') || 
                           perguntaLower.includes('preco') || 
                           perguntaLower.includes('preço') ||
                           perguntaLower.includes('desconto') ||
                           perguntaLower.includes('categoria');
    
    if (buscarProdutos) {
      
      const produtos = await Produto.selectAllProdutos();
      const totalProdutos = produtos ? produtos.length : 0;
      
      contexto += `\n=== DADOS DE PRODUTOS ===\n`;
      contexto += `Total de produtos: ${totalProdutos}\n\n`;
      
      // Incluir detalhes completos de cada produto
      if (produtos && produtos.length > 0) {
        produtos.forEach((p, index) => {
          contexto += `Produto ${index + 1}:\n`;
          contexto += `- Nome: ${p.nome}\n`;
          contexto += `- Descrição: ${p.descricao || 'Sem descrição'}\n`;
          contexto += `- Categoria: ${p.categoria || 'Sem categoria'}\n`;
          contexto += `- Preço: R$ ${p.preco ? Number(p.preco).toFixed(2) : '0.00'}\n`;
          
          // Informações de promoção
          if (p.preco_promocional && p.data_inicio && p.data_fim) {
            contexto += `- ⭐ EM PROMOÇÃO: R$ ${Number(p.preco_promocional).toFixed(2)}\n`;
            const dataInicio = formatarData(p.data_inicio);
            const dataFim = formatarData(p.data_fim);
            contexto += `- Promoção válida de ${dataInicio} até ${dataFim}\n`;
            const desconto = ((Number(p.preco) - Number(p.preco_promocional)) / Number(p.preco) * 100).toFixed(0);
            contexto += `- Desconto: ${desconto}%\n`;
          } else {
            contexto += `- Promoção: Não possui promoção ativa\n`;
          }
          
          contexto += `\n`;
        });
      }
    }
    
    // Se não encontrou contexto específico, busca todos os produtos como padrão
    if (!contexto.trim()) {
      const produtos = await Produto.selectAllProdutos();
      
      contexto = `\n=== CATÁLOGO DE PRODUTOS ===\n`;
      contexto += `Total de produtos cadastrados: ${produtos ? produtos.length : 0}\n\n`;
      
      // Incluir detalhes completos de todos os produtos
      if (produtos && produtos.length > 0) {
        produtos.forEach((p, index) => {
          contexto += `Produto ${index + 1}:\n`;
          contexto += `- Nome: ${p.nome}\n`;
          contexto += `- Descrição: ${p.descricao || 'Sem descrição'}\n`;
          contexto += `- Categoria: ${p.categoria || 'Sem categoria'}\n`;
          contexto += `- Preço: R$ ${p.preco ? Number(p.preco).toFixed(2) : '0.00'}\n`;
          
          if (p.preco_promocional && p.data_inicio && p.data_fim) {
            contexto += `- ⭐ EM PROMOÇÃO: R$ ${Number(p.preco_promocional).toFixed(2)}\n`;
            const dataInicio = formatarData(p.data_inicio);
            const dataFim = formatarData(p.data_fim);
            contexto += `- Promoção válida de ${dataInicio} até ${dataFim}\n`;
            const desconto = ((Number(p.preco) - Number(p.preco_promocional)) / Number(p.preco) * 100).toFixed(0);
            contexto += `- Desconto: ${desconto}%\n`;
          } else {
            contexto += `- Promoção: Não possui promoção ativa\n`;
          }
          
          contexto += `\n`;
        });
      } else {
        contexto += `Nenhum produto cadastrado no momento.\n`;
      }
    }

    console.log('📤 Enviando para IA com contexto de', contexto.length, 'caracteres');
    const resultado = await perguntarIA(pergunta, contexto);
    
    console.log('✅ Resposta recebida da fonte:', resultado.fonte);
    
    // Se for fallback local, retornar com status 200 mas indicar o problema
    if (resultado.fonte === 'fallback_local') {
      return res.json({ 
        resposta: resultado.resposta,
        fonte: resultado.fonte,
        tempo_resposta: resultado.tempo_resposta,
        aviso: 'IA temporariamente indisponível - usando resposta padrão',
        erro_tecnico: resultado.erro
      });
    }
    
    res.json({ 
      resposta: resultado.resposta,
      fonte: resultado.fonte,
      tempo_resposta: resultado.tempo_resposta
    });
    
  } catch (err) {
    console.error('❌ ERRO CRÍTICO no groqController:', err);
    console.error('Stack:', err.stack);
    res.status(503).json({ 
      erro: 'Serviço de IA temporariamente indisponível',
      detalhes: err.message,
      status: 'Groq API não respondeu',
      dica: 'Verifique GROQ_API_KEY no .env e sua conexão com internet'
    });
  }
}

module.exports = { interpretarPergunta };
