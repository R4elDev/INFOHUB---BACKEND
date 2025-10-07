// ====================================
// 📋 EXEMPLOS DE USO - InfoHub API
// ====================================

// Configuração base
const API_BASE = 'http://localhost:8080/v1/infohub';
const AI_BASE = 'http://localhost:5001';

// ====================================
// 🔐 AUTENTICAÇÃO
// ====================================

// 1. Cadastrar usuário
async function cadastrarUsuario() {
  const response = await fetch(`${API_BASE}/usuarios/cadastro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome: "João Silva",
      email: "joao@email.com",
      senha: "123456",
      data_nascimento: "1990-05-15",
      telefone: "(11) 99999-9999"
    })
  });
  
  const data = await response.json();
  console.log('Usuário criado:', data);
  return data;
}

// 2. Fazer login
async function fazerLogin() {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: "joao@email.com",
      senha: "123456"
    })
  });
  
  const data = await response.json();
  console.log('Login realizado:', data);
  
  // Salvar token para usar em outras requisições
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

// 3. Função para pegar token salvo
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// ====================================
// 👥 GESTÃO DE USUÁRIOS
// ====================================

// 4. Listar todos os usuários (protegido)
async function listarUsuarios() {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/usuarios`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Lista de usuários:', data);
  return data;
}

// 5. Buscar usuário específico
async function buscarUsuario(id) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/usuario/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Usuário encontrado:', data);
  return data;
}

// 6. Atualizar usuário
async function atualizarUsuario(id, dadosAtualizados) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/usuario/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosAtualizados)
  });
  
  const data = await response.json();
  console.log('Usuário atualizado:', data);
  return data;
}

// ====================================
// 🔑 RECUPERAÇÃO DE SENHA
// ====================================

// 7. Solicitar recuperação de senha
async function solicitarRecuperacao(email) {
  const response = await fetch(`${API_BASE}/recuperar-senha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  console.log('Código enviado:', data);
  return data;
}

// 8. Validar código de recuperação
async function validarCodigo(email, codigo) {
  const response = await fetch(`${API_BASE}/validar-codigo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, codigo })
  });
  
  const data = await response.json();
  console.log('Código validado:', data);
  return data;
}

// 9. Redefinir senha
async function redefinirSenha(email, codigo, nova_senha) {
  const response = await fetch(`${API_BASE}/redefinir-senha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, codigo, nova_senha })
  });
  
  const data = await response.json();
  console.log('Senha redefinida:', data);
  return data;
}

// ====================================
// 🤖 CHAT COM IA
// ====================================

// 10. Chat via API principal (com autenticação)
async function chatComIA(mensagem, idUsuario) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/interagir`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mensagem,
      idUsuario
    })
  });
  
  const data = await response.json();
  console.log('Resposta da IA:', data);
  return data;
}

// 11. Chat direto com IA (sem autenticação)
async function chatDiretoIA(message, user_id = 1) {
  const response = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      user_id,
      session_id: `session_${Date.now()}`
    })
  });
  
  const data = await response.json();
  console.log('Resposta direta da IA:', data);
  return data;
}

// ====================================
// 📊 MONITORAMENTO
// ====================================

// 12. Status do serviço IA
async function statusIA() {
  const response = await fetch(`${AI_BASE}/health`);
  const data = await response.json();
  console.log('Status IA:', data);
  return data;
}

// 13. Estatísticas de performance
async function estatisticasIA() {
  const response = await fetch(`${AI_BASE}/stats`);
  const data = await response.json();
  console.log('Estatísticas:', data);
  return data;
}

// ====================================
// 🧪 EXEMPLOS DE FLUXOS COMPLETOS
// ====================================

// Fluxo completo: Cadastro → Login → Chat
async function fluxoCompleto() {
  try {
    console.log('🚀 Iniciando fluxo completo...\n');
    
    // 1. Cadastrar usuário
    console.log('1️⃣ Cadastrando usuário...');
    const usuario = await cadastrarUsuario();
    
    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const login = await fazerLogin();
    
    // 3. Chat com IA
    console.log('\n3️⃣ Testando chat com IA...');
    
    // Exemplos de mensagens
    const mensagens = [
      "oi",
      "quais as promoções?", 
      "leite barato",
      "como funciona?"
    ];
    
    for (const msg of mensagens) {
      console.log(`\n💬 Pergunta: "${msg}"`);
      const resposta = await chatComIA(msg, usuario.data.id);
      console.log(`🤖 Resposta: ${resposta.data.reply}`);
      console.log(`⚡ Tempo: ${resposta.data.response_time_ms}ms`);
    }
    
    console.log('\n✅ Fluxo completo executado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no fluxo:', error);
  }
}

// Teste de performance da IA
async function testePerformance() {
  console.log('🏃‍♂️ Testando performance da IA...\n');
  
  const mensagens = [
    "oi",
    "tchau", 
    "obrigado",
    "como vai?",
    "quais as promoções?"
  ];
  
  const tempos = [];
  
  for (let i = 0; i < mensagens.length; i++) {
    const inicio = Date.now();
    const resposta = await chatDiretoIA(mensagens[i]);
    const fim = Date.now();
    const tempo = fim - inicio;
    
    tempos.push(tempo);
    console.log(`${i+1}. "${mensagens[i]}" → ${tempo}ms (${resposta.method})`);
  }
  
  const tempoMedio = tempos.reduce((a, b) => a + b) / tempos.length;
  console.log(`\n📊 Tempo médio: ${tempoMedio.toFixed(1)}ms`);
  console.log(`🎯 Meta: < 100ms ${tempoMedio < 100 ? '✅' : '❌'}`);
}

// ====================================
// 🎮 TESTES INTERATIVOS
// ====================================

// Chat interativo no console
async function chatInterativo() {
  console.log('💬 Chat Interativo com IA');
  console.log('Digite "sair" para terminar\n');
  
  // Simular readline para exemplo
  const mensagens = [
    "oi",
    "quais as promoções de leite?",
    "melhores preços perto de mim",
    "como funciona o sistema?",
    "sair"
  ];
  
  for (const msg of mensagens) {
    if (msg.toLowerCase() === 'sair') {
      console.log('👋 Até logo!');
      break;
    }
    
    console.log(`\n👤 Você: ${msg}`);
    
    try {
      const resposta = await chatDiretoIA(msg);
      console.log(`🤖 IA: ${resposta.reply}`);
      console.log(`⚡ ${resposta.response_time_ms}ms | ${resposta.method}`);
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

// ====================================
// 📱 EXEMPLO PARA REACT/VUE
// ====================================

// Hook personalizado para React
function useInfoHubAPI() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  
  const api = {
    // Autenticação
    login: async (email, senha) => {
      setLoading(true);
      try {
        const data = await fazerLogin();
        if (data.token) {
          setToken(data.token);
        }
        return data;
      } finally {
        setLoading(false);
      }
    },
    
    // Chat
    chat: async (mensagem, idUsuario) => {
      setLoading(true);
      try {
        return await chatComIA(mensagem, idUsuario);
      } finally {
        setLoading(false);
      }
    },
    
    // Chat direto (sem auth)
    chatRapido: async (mensagem) => {
      return await chatDiretoIA(mensagem);
    }
  };
  
  return { api, loading, token };
}

// ====================================
// 🚀 EXECUTAR EXEMPLOS
// ====================================

// Descomente para testar:

// fluxoCompleto();
// testePerformance();
// chatInterativo();

console.log('📋 Exemplos de uso carregados!');
console.log('Use as funções acima para testar a API.');
console.log('\nFunções disponíveis:');
console.log('- fluxoCompleto() - Teste completo');
console.log('- testePerformance() - Teste de velocidade');
console.log('- chatInterativo() - Chat no console');
console.log('- statusIA() - Status do serviço');
console.log('- estatisticasIA() - Métricas de performance');

export {
  // Autenticação
  cadastrarUsuario,
  fazerLogin,
  getAuthToken,
  
  // Usuários
  listarUsuarios,
  buscarUsuario,
  atualizarUsuario,
  
  // Recuperação de senha
  solicitarRecuperacao,
  validarCodigo,
  redefinirSenha,
  
  // Chat IA
  chatComIA,
  chatDiretoIA,
  
  // Monitoramento
  statusIA,
  estatisticasIA,
  
  // Fluxos
  fluxoCompleto,
  testePerformance,
  chatInterativo,
  
  // React hook
  useInfoHubAPI
};