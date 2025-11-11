/**
 * 🚀 InfoHub API - Exemplos Práticos de Integração Frontend
 * PUT /usuario/{id} - Atualização de Usuário
 * 
 * Este arquivo contém exemplos completos para diferentes cenários de uso
 */

const API_BASE = 'http://localhost:8080/v1/infohub';

// ================================================================
// 🔧 FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ================================================================

/**
 * Função principal para atualizar usuário
 * @param {number} userId - ID do usuário
 * @param {object} campos - Campos a serem atualizados
 * @param {string} token - JWT token
 * @returns {Promise<object>} Usuário atualizado
 */
const atualizarUsuario = async (userId, campos, token) => {
  try {
    const response = await fetch(`${API_BASE}/usuario/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campos)
    });

    const resultado = await response.json();

    if (!resultado.status) {
      throw new Error(resultado.message);
    }

    return resultado;
  } catch (error) {
    console.error('❌ Erro na atualização:', error.message);
    throw error;
  }
};

// ================================================================
// 📝 EXEMPLOS DE USO - DIFERENTES CENÁRIOS
// ================================================================

// Substitua por seu token JWT real
const MEU_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const USER_ID = 1; // ID do usuário a ser atualizado

// ----------------------------------------------------------------
// 1️⃣ ATUALIZAÇÃO SIMPLES - UM CAMPO
// ----------------------------------------------------------------

async function exemploAtualizarNome() {
  try {
    const resultado = await atualizarUsuario(USER_ID, {
      nome: "João da Silva Santos"
    }, MEU_TOKEN);
    
    console.log('✅ Nome atualizado:', resultado.usuario.nome);
    console.log('📝 Campos alterados:', resultado.campos_atualizados);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ----------------------------------------------------------------
// 2️⃣ ATUALIZAÇÃO MÚLTIPLA - VÁRIOS CAMPOS
// ----------------------------------------------------------------

async function exemploAtualizarMultiplosCampos() {
  try {
    const resultado = await atualizarUsuario(USER_ID, {
      nome: "Maria Silva",
      email: "maria.silva@empresa.com",
      telefone: "(11) 99999-8888",
      perfil: "admin"
    }, MEU_TOKEN);
    
    console.log('✅ Usuário atualizado:', resultado.usuario);
    console.log('📝 Campos alterados:', resultado.campos_atualizados);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ----------------------------------------------------------------
// 3️⃣ ATUALIZAÇÃO DE SENHA
// ----------------------------------------------------------------

async function exemploAtualizarSenha() {
  try {
    const novaSenha = "minhaNovaSenhaSegura123";
    
    const resultado = await atualizarUsuario(USER_ID, {
      senha: novaSenha
    }, MEU_TOKEN);
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('🔐 Senha foi hasheada automaticamente');
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error.message);
  }
}

// ----------------------------------------------------------------
// 4️⃣ LIMPAR CAMPOS OPCIONAIS (DEFINIR COMO NULL)
// ----------------------------------------------------------------

async function exemploLimparCampos() {
  try {
    const resultado = await atualizarUsuario(USER_ID, {
      telefone: null,  // Remove o telefone
      cpf: null,       // Remove o CPF
      cnpj: null       // Remove o CNPJ
    }, MEU_TOKEN);
    
    console.log('✅ Campos limpos (definidos como NULL)');
    console.log('📝 Campos alterados:', resultado.campos_atualizados);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ----------------------------------------------------------------
// 5️⃣ FORMULÁRIO INTELIGENTE - SÓ ENVIA CAMPOS ALTERADOS
// ----------------------------------------------------------------

/**
 * Compara dados do formulário com dados originais e envia apenas campos alterados
 */
async function exemploFormularioInteligente() {
  // Dados originais do usuário (vindos de uma consulta GET anterior)
  const dadosOriginais = {
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    perfil: "consumidor"
  };

  // Dados do formulário (o que o usuário preencheu)
  const dadosFormulario = {
    nome: "João Silva Santos",    // ⬅️ ALTERADO
    email: "joao@email.com",      // ⬅️ MESMO VALOR
    telefone: "(11) 91234-5678",  // ⬅️ ALTERADO
    perfil: "consumidor"          // ⬅️ MESMO VALOR
  };

  // Detectar apenas campos que realmente mudaram
  const camposAlterados = {};
  
  Object.keys(dadosFormulario).forEach(campo => {
    if (dadosFormulario[campo] !== dadosOriginais[campo]) {
      camposAlterados[campo] = dadosFormulario[campo];
    }
  });

  console.log('🔍 Campos detectados como alterados:', camposAlterados);
  
  // Só faz a requisição se houver campos alterados
  if (Object.keys(camposAlterados).length > 0) {
    try {
      const resultado = await atualizarUsuario(USER_ID, camposAlterados, MEU_TOKEN);
      console.log('✅ Atualização otimizada concluída!');
      console.log('📝 Campos atualizados:', resultado.campos_atualizados);
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  } else {
    console.log('ℹ️ Nenhum campo foi alterado, nenhuma requisição enviada');
  }
}

// ================================================================
// 🎛️ FUNÇÃO DE VALIDAÇÃO FRONTEND (OPCIONAL)
// ================================================================

/**
 * Valida dados antes de enviar (validação extra no frontend)
 */
function validarCampos(campos) {
  const erros = [];

  if (campos.nome !== undefined) {
    if (!campos.nome || campos.nome.trim() === '') {
      erros.push('Nome não pode estar vazio');
    } else if (campos.nome.length > 100) {
      erros.push('Nome deve ter no máximo 100 caracteres');
    }
  }

  if (campos.email !== undefined) {
    if (!campos.email || !campos.email.includes('@')) {
      erros.push('Email deve ser válido');
    } else if (campos.email.length > 150) {
      erros.push('Email deve ter no máximo 150 caracteres');
    }
  }

  if (campos.senha !== undefined) {
    if (!campos.senha || campos.senha.length < 6) {
      erros.push('Senha deve ter pelo menos 6 caracteres');
    } else if (campos.senha.length > 100) {
      erros.push('Senha deve ter no máximo 100 caracteres');
    }
  }

  if (campos.perfil !== undefined) {
    const perfisValidos = ['consumidor', 'admin', 'estabelecimento'];
    if (!perfisValidos.includes(campos.perfil)) {
      erros.push('Perfil deve ser: consumidor, admin ou estabelecimento');
    }
  }

  if (campos.telefone !== undefined && campos.telefone) {
    if (campos.telefone.length > 20) {
      erros.push('Telefone deve ter no máximo 20 caracteres');
    }
  }

  return erros;
}

// ----------------------------------------------------------------
// 6️⃣ ATUALIZAÇÃO COM VALIDAÇÃO FRONTEND
// ----------------------------------------------------------------

async function exemploComValidacao() {
  const campos = {
    nome: "Maria Santos",
    senha: "123456789",
    email: "maria@empresa.com"
  };

  // Validar antes de enviar
  const erros = validarCampos(campos);
  
  if (erros.length > 0) {
    console.error('❌ Erros de validação:');
    erros.forEach(erro => console.error(`  - ${erro}`));
    return;
  }

  // Se passou na validação, envia
  try {
    const resultado = await atualizarUsuario(USER_ID, campos, MEU_TOKEN);
    console.log('✅ Atualização validada e concluída!');
  } catch (error) {
    console.error('❌ Erro do servidor:', error.message);
  }
}

// ================================================================
// 🔄 FUNÇÃO PARA REACT/VUE - HOOK PERSONALIZADO
// ================================================================

/**
 * Hook personalizado para atualização de usuário (estilo React)
 */
function useAtualizarUsuario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const atualizar = async (userId, campos, token) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await atualizarUsuario(userId, campos, token);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { atualizar, loading, error };
}

// ================================================================
// 📱 EXEMPLO DE USO EM COMPONENTE REACT
// ================================================================

/*
function ComponenteAtualizar({ userId, token }) {
  const { atualizar, loading, error } = useAtualizarUsuario();
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Remove campos vazios
    const camposLimpos = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== '' && value !== undefined)
    );

    if (Object.keys(camposLimpos).length === 0) {
      alert('Preencha pelo menos um campo para atualizar');
      return;
    }

    try {
      const resultado = await atualizar(userId, camposLimpos, token);
      alert(`Sucesso! Campos atualizados: ${resultado.campos_atualizados.join(', ')}`);
      setFormData({});
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Nome (opcional)"
        value={formData.nome || ''}
        onChange={(e) => setFormData({...formData, nome: e.target.value})}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar'}
      </button>
    </form>
  );
}
*/

// ================================================================
// 🧪 TESTE TODOS OS EXEMPLOS
// ================================================================

async function executarTodosExemplos() {
  console.log('🚀 Iniciando testes de atualização...\n');
  
  console.log('1️⃣ Teste: Atualizar nome');
  await exemploAtualizarNome();
  
  console.log('\n2️⃣ Teste: Atualizar múltiplos campos');
  await exemploAtualizarMultiplosCampos();
  
  console.log('\n3️⃣ Teste: Atualizar senha');
  await exemploAtualizarSenha();
  
  console.log('\n4️⃣ Teste: Limpar campos');
  await exemploLimparCampos();
  
  console.log('\n5️⃣ Teste: Formulário inteligente');
  await exemploFormularioInteligente();
  
  console.log('\n6️⃣ Teste: Com validação');
  await exemploComValidacao();
  
  console.log('\n✅ Todos os testes concluídos!');
}

// ================================================================
// 📤 EXPORTAÇÕES PARA USO EM OUTROS ARQUIVOS
// ================================================================

// Se estiver usando módulos ES6
// export { atualizarUsuario, validarCampos, useAtualizarUsuario };

// Se estiver usando CommonJS
// module.exports = { atualizarUsuario, validarCampos, useAtualizarUsuario };

// ================================================================
// 💡 COMO USAR ESTE ARQUIVO
// ================================================================

/*
1. Substitua MEU_TOKEN pelo seu JWT token real
2. Substitua USER_ID pelo ID do usuário que quer atualizar
3. Execute as funções individualmente ou todas de uma vez:

   - exemploAtualizarNome()
   - exemploAtualizarMultiplosCampos()
   - exemploAtualizarSenha()
   - exemploLimparCampos()
   - exemploFormularioInteligente()
   - exemploComValidacao()
   - executarTodosExemplos() // Executa todos

4. Adapte os exemplos para seu framework (React, Vue, Angular, etc.)
5. Use as funções utilitárias em seus próprios componentes
*/