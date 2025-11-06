// ====================================
// 🎯 SCRIPT DE TESTE PARA APRESENTAÇÃO TCC
// ====================================

const axios = require('axios');

const API_BASE = 'http://localhost:8080/v1/infohub';

// Perguntas para demonstrar na apresentação
const perguntasDemo = [
  "Quantos usuários eu tenho cadastrados?",
  "Quais produtos estão em promoção hoje?",
  "Qual o preço do leite nos diferentes estabelecimentos?",
  "Mostre os produtos da categoria laticínios",
  "Quantos estabelecimentos tenho cadastrados?",
  "Me dê um resumo geral do sistema",
  "Quais são os produtos mais baratos?",
  "Mostre as melhores promoções disponíveis",
  "Quantas categorias de produtos existem?",
  "Quais medicamentos estão disponíveis?"
];

async function testarPergunta(pergunta, index) {
  try {
    console.log(`\n🎯 Teste ${index + 1}: "${pergunta}"`);
    console.log('⏱️  Enviando requisição...');
    
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE}/chat-groq`, {
      pergunta: pergunta
    }, {
      timeout: 15000 // 15 segundos timeout
    });
    
    const endTime = Date.now();
    const tempoTotal = endTime - startTime;
    
    console.log(`✅ Resposta em ${tempoTotal}ms`);
    console.log(`📡 Fonte: ${response.data.fonte || 'groq'}`);
    console.log(`💬 Resposta: ${response.data.resposta.substring(0, 200)}...`);
    
    return {
      pergunta,
      sucesso: true,
      tempo: tempoTotal,
      fonte: response.data.fonte,
      resposta: response.data.resposta
    };
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return {
      pergunta,
      sucesso: false,
      erro: error.message
    };
  }
}

async function testeCompleto() {
  console.log('🚀 INICIANDO TESTE COMPLETO PARA APRESENTAÇÃO TCC');
  console.log('=' .repeat(60));
  
  const resultados = [];
  
  for (let i = 0; i < perguntasDemo.length; i++) {
    const resultado = await testarPergunta(perguntasDemo[i], i);
    resultados.push(resultado);
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  
  const sucessos = resultados.filter(r => r.sucesso).length;
  const falhas = resultados.filter(r => !r.sucesso).length;
  
  console.log(`✅ Sucessos: ${sucessos}/${resultados.length}`);
  console.log(`❌ Falhas: ${falhas}/${resultados.length}`);
  console.log(`📈 Taxa de sucesso: ${(sucessos/resultados.length*100).toFixed(1)}%`);
  
  if (sucessos > 0) {
    const tempos = resultados.filter(r => r.sucesso).map(r => r.tempo);
    const tempoMedio = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    console.log(`⏱️  Tempo médio: ${tempoMedio.toFixed(0)}ms`);
  }
  
  // Mostrar fontes utilizadas
  const fontes = {};
  resultados.filter(r => r.sucesso).forEach(r => {
    fontes[r.fonte] = (fontes[r.fonte] || 0) + 1;
  });
  
  console.log('\n📡 FONTES UTILIZADAS:');
  Object.entries(fontes).forEach(([fonte, count]) => {
    console.log(`   ${fonte}: ${count} respostas`);
  });
  
  console.log('\n🎉 SISTEMA PRONTO PARA APRESENTAÇÃO!');
}

async function testeStress() {
  console.log('🔥 TESTE DE STRESS - 20 REQUISIÇÕES RÁPIDAS');
  console.log('=' .repeat(60));
  
  const promises = [];
  const pergunta = "Quantos usuários tenho?";
  
  for (let i = 0; i < 20; i++) {
    promises.push(testarPergunta(pergunta, i));
  }
  
  const resultados = await Promise.all(promises);
  const sucessos = resultados.filter(r => r.sucesso).length;
  
  console.log(`\n📊 Resultado do stress test: ${sucessos}/20 sucessos`);
  console.log(`📈 Taxa de sucesso: ${(sucessos/20*100).toFixed(1)}%`);
}

// Executar testes
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--stress')) {
    await testeStress();
  } else if (args.includes('--single')) {
    await testarPergunta("Quantos usuários tenho cadastrados?", 0);
  } else {
    await testeCompleto();
  }
}

main().catch(console.error);
