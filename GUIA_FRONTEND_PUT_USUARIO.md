# 🚀 InfoHub API - Guia de Integração Frontend 
## **PUT /usuario/{id} - Atualização de Usuário**

---

## 📋 **RESUMO EXECUTIVO**

### ✅ **O QUE É OBRIGATÓRIO:**
1. **JWT Token** no header Authorization  
2. **ID do usuário** na URL (path parameter)
3. **Content-Type: application/json**
4. **Pelo menos 1 campo** no body para atualizar

### ❌ **O QUE NÃO É OBRIGATÓRIO:**
- **Nenhum campo específico** no body é obrigatório
- **Usuário pode enviar apenas os campos que quer alterar**
- **Campos não enviados permanecem inalterados no banco**

---

## 🎯 **ENDPOINT**

```http
PUT /v1/infohub/usuario/{id}
```

---

## 🔐 **HEADERS OBRIGATÓRIOS**

```javascript
{
  "Content-Type": "application/json",           // ✅ OBRIGATÓRIO
  "Authorization": "Bearer {jwt_token}"         // ✅ OBRIGATÓRIO
}
```

---

## 📝 **BODY - CAMPOS DISPONÍVEIS (TODOS OPCIONAIS)**

| Campo | Tipo | Validação | Obrigatório | Exemplo |
|-------|------|-----------|-------------|---------|
| `nome` | string | 1-100 chars | ❌ | "João Silva Santos" |
| `email` | string | 1-150 chars | ❌ | "novo@email.com" |
| `senha` | string | 6-100 chars | ❌ | "novaSenha123" |
| `perfil` | string | enum válido | ❌ | "consumidor" |
| `cpf` | string/null | max 100 chars | ❌ | "123.456.789-00" |
| `cnpj` | string/null | max 100 chars | ❌ | "12.345.678/0001-90" |
| `telefone` | string/null | max 20 chars | ❌ | "(11) 99999-9999" |
| `data_nascimento` | string/null | formato data | ❌ | "1990-05-15" |

### 🎛️ **Valores Enum para `perfil`:**
- `"consumidor"` (padrão)
- `"admin"` 
- `"estabelecimento"`

---

## 💻 **EXEMPLOS PRÁTICOS DE USO**

### **📝 1. Atualizar apenas o nome:**
```javascript
// REQUEST
PUT /v1/infohub/usuario/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...

{
  "nome": "João Silva Santos"
}

// RESPONSE (200)
{
  "status": true,
  "status_code": 200,
  "message": "Usuário atualizado com sucesso!",
  "usuario": {
    "id_usuario": 1,
    "nome": "João Silva Santos",
    "email": "joao@email.com",      // ⬅️ Mantido valor anterior
    "perfil": "consumidor",         // ⬅️ Mantido valor anterior
    "cpf": "123.456.789-00",        // ⬅️ Mantido valor anterior
    "telefone": "(11) 98765-4321",  // ⬅️ Mantido valor anterior
    "data_nascimento": "1990-05-15" // ⬅️ Mantido valor anterior
  },
  "campos_atualizados": ["nome"]
}
```

### **📧 2. Atualizar email e telefone:**
```javascript
{
  "email": "novo.email@empresa.com",
  "telefone": "(11) 91234-5678"
}
// ✅ Só estes 2 campos serão alterados
```

### **🔐 3. Alterar apenas a senha:**
```javascript
{
  "senha": "minhaNovaSenha123"
}
// ✅ Senha será hasheada automaticamente com bcrypt
// ✅ Outros campos permanecem inalterados
```

### **🎭 4. Atualizar perfil para admin:**
```javascript
{
  "perfil": "admin"
}
```

### **🗑️ 5. Limpar campos opcionais (definir como NULL):**
```javascript
{
  "telefone": null,
  "cpf": null
}
// ✅ Remove telefone e CPF (define como NULL no banco)
```

### **🔄 6. Atualização múltipla:**
```javascript
{
  "nome": "Maria Silva",
  "email": "maria.silva@empresa.com",
  "perfil": "admin",
  "telefone": "(11) 99999-8888"
}
// ✅ 4 campos atualizados de uma vez
```

---

## ⚠️ **VALIDAÇÕES E ERROS**

### **❌ Erro: Nenhum campo enviado**
```javascript
// REQUEST
{}

// RESPONSE (400)
{
  "status": false,
  "status_code": 400,
  "message": "Nenhum campo válido foi enviado para atualização"
}
```

### **❌ Erro: Nome inválido**
```javascript
// REQUEST
{ "nome": "" }

// RESPONSE (400)
{
  "status": false,
  "status_code": 400,
  "message": "Nome deve ter entre 1 e 100 caracteres"
}
```

### **❌ Erro: Senha muito curta**
```javascript
// REQUEST
{ "senha": "123" }

// RESPONSE (400)
{
  "status": false,
  "status_code": 400,
  "message": "Senha deve ter entre 6 e 100 caracteres"
}
```

### **❌ Erro: Perfil inválido**
```javascript
// REQUEST
{ "perfil": "gerente" }

// RESPONSE (400)
{
  "status": false,
  "status_code": 400,
  "message": "Perfil deve ser: consumidor, admin ou estabelecimento"
}
```

### **❌ Erro: Token inválido**
```javascript
// RESPONSE (401)
{
  "status": false,
  "status_code": 401,
  "message": "Token inválido ou não fornecido"
}
```

### **❌ Erro: Usuário não encontrado**
```javascript
// RESPONSE (404)
{
  "status": false,
  "status_code": 404,
  "message": "Usuário não encontrado"
}
```

---

## 🛠️ **CÓDIGO FRONTEND (JavaScript)**

### **⚡ Função completa para atualização:**

```javascript
/**
 * Atualiza usuário de forma parcial
 * @param {number} userId - ID do usuário
 * @param {object} camposParaAtualizar - Campos que serão alterados
 * @param {string} token - JWT token
 * @returns {Promise} Dados do usuário atualizado
 */
const atualizarUsuario = async (userId, camposParaAtualizar, token) => {
  try {
    // Validação básica
    if (!userId || !token) {
      throw new Error('ID do usuário e token são obrigatórios');
    }

    if (!camposParaAtualizar || Object.keys(camposParaAtualizar).length === 0) {
      throw new Error('Pelo menos um campo deve ser enviado para atualização');
    }

    // Fazer requisição
    const response = await fetch(`http://localhost:8080/v1/infohub/usuario/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(camposParaAtualizar)
    });

    const resultado = await response.json();

    // Tratar resposta
    if (resultado.status) {
      console.log(`✅ Usuário atualizado com sucesso!`);
      console.log(`📝 Campos alterados: ${resultado.campos_atualizados.join(', ')}`);
      return resultado.usuario;
    } else {
      throw new Error(resultado.message);
    }

  } catch (error) {
    console.error('❌ Erro na atualização:', error.message);
    throw error;
  }
};
```

### **🎯 Exemplos de uso da função:**

```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6..."; // Seu JWT token

// 1. Atualizar apenas o nome
try {
  const usuario = await atualizarUsuario(1, { 
    nome: "Novo Nome" 
  }, token);
  console.log('Usuário:', usuario);
} catch (error) {
  console.error('Erro:', error.message);
}

// 2. Atualizar email e telefone
await atualizarUsuario(1, {
  email: "novo@email.com",
  telefone: "(11) 99999-9999"
}, token);

// 3. Alterar senha
await atualizarUsuario(1, {
  senha: "novaSenha123"
}, token);

// 4. Promover para admin
await atualizarUsuario(1, {
  perfil: "admin"
}, token);

// 5. Remover CPF
await atualizarUsuario(1, {
  cpf: null
}, token);

// 6. Atualização múltipla
await atualizarUsuario(1, {
  nome: "Maria Santos",
  email: "maria@empresa.com",
  perfil: "admin",
  telefone: "(11) 88888-7777"
}, token);
```

---

## 📱 **INTEGRAÇÃO COM REACT**

### **🎨 Componente de exemplo:**

```jsx
import React, { useState } from 'react';

const AtualizarUsuario = ({ userId, token, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove campos vazios
      const dadosLimpos = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '' && value !== undefined)
      );

      const usuario = await atualizarUsuario(userId, dadosLimpos, token);
      
      onSuccess?.(usuario);
      setFormData({});
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Atualizar Usuário (Campos Opcionais)</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Nome:</label>
        <input
          type="text"
          value={formData.nome || ''}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Deixe vazio para não alterar"
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Deixe vazio para não alterar"
        />
      </div>

      <div>
        <label>Nova Senha:</label>
        <input
          type="password"
          value={formData.senha || ''}
          onChange={(e) => handleInputChange('senha', e.target.value)}
          placeholder="Deixe vazio para não alterar"
        />
      </div>

      <div>
        <label>Perfil:</label>
        <select
          value={formData.perfil || ''}
          onChange={(e) => handleInputChange('perfil', e.target.value)}
        >
          <option value="">Não alterar</option>
          <option value="consumidor">Consumidor</option>
          <option value="admin">Admin</option>
          <option value="estabelecimento">Estabelecimento</option>
        </select>
      </div>

      <div>
        <label>Telefone:</label>
        <input
          type="tel"
          value={formData.telefone || ''}
          onChange={(e) => handleInputChange('telefone', e.target.value)}
          placeholder="Deixe vazio para não alterar"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Campos Preenchidos'}
      </button>
    </form>
  );
};
```

---

## 🚦 **FLUXO DE VALIDAÇÃO**

```mermaid
graph TD
    A[Frontend envia PUT] --> B{Token válido?}
    B -->|Não| C[Erro 401]
    B -->|Sim| D{Usuário existe?}
    D -->|Não| E[Erro 404]
    D -->|Sim| F{Pelo menos 1 campo enviado?}
    F -->|Não| G[Erro 400: Nenhum campo]
    F -->|Sim| H[Validar cada campo enviado]
    H --> I{Todos campos válidos?}
    I -->|Não| J[Erro 400: Campo específico]
    I -->|Sim| K[Hash senha se enviada]
    K --> L[Atualizar no banco]
    L --> M[Retornar usuário atualizado]
```

---

## 📊 **RESUMO PARA O FRONTEND**

### ✅ **OBRIGATÓRIO:**
- **URL:** `PUT /v1/infohub/usuario/{id}`
- **Header:** `Authorization: Bearer {token}`
- **Header:** `Content-Type: application/json`
- **Body:** Pelo menos 1 campo para atualizar

### 🎯 **FLEXIBILIDADES:**
- **Qualquer campo** pode ser enviado ou omitido
- **Campos omitidos** não são alterados no banco
- **Validação** só acontece para campos enviados
- **Senha** é hasheada automaticamente se fornecida
- **Perfil** tem valores válidos específicos
- **CPF/CNPJ/Telefone** podem ser definidos como `null`

### 🔄 **ESTRATÉGIAS DE USO:**
1. **Atualização parcial:** Envie só os campos alterados
2. **Formulários dinâmicos:** Compare com dados originais
3. **Campos limpos:** Remova campos vazios antes de enviar
4. **Tratamento de erros:** Capture e exiba mensagens específicas

**Isso é tudo que o frontend precisa saber para integrar perfeitamente! 🚀**