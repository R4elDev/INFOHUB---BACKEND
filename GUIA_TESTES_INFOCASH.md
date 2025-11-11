# 🧪 GUIA DE TESTES COMPLETOS - INFOHUB BACKEND

## 📋 Pré-requisitos

1. **Banco de dados configurado** com todas as tabelas
2. **Servidor rodando** (node app.js)
3. **Dependências instaladas** (npm install)

## 🚀 Como Executar os Testes

### 🎯 TESTE COMPLETO (Recomendado)
```bash
node teste_completo_sistema.js
```
**Executa tudo:**
- ✅ Sistema InfoCash completo
- ✅ Rede Social completa
- ✅ Teste de performance
- ✅ Relatório de saúde do sistema

### 1️⃣ TESTE RÁPIDO DO INFOCASH
```bash
node teste_infocash_rapido.js
```
**O que testa:**
- ✅ Consulta de saldo
- ✅ Histórico de transações 
- ✅ Resumo por tipo de ação
- ✅ Concessão manual de pontos
- ✅ Ranking de usuários
- ✅ Estatísticas gerais
- ✅ Busca por período

### 1️⃣ TESTE RÁPIDO DA REDE SOCIAL
```bash
node teste_rede_social.js
```
**O que testa:**
- ✅ Criação de posts
- ✅ Sistema de comentários
- ✅ Sistema de curtidas
- ✅ Feed da rede social
- ✅ Posts por usuário
- ✅ Posts relacionados (produto/estabelecimento)
- ✅ Performance das consultas

### 2️⃣ TESTE DAS APIs INFOCASH (Via HTTP)
```bash
# Primeiro inicie o servidor em um terminal
node app.js

# Em outro terminal, execute o teste
node teste_apis_infocash.js
```
**O que testa:**
- 🌐 GET /infocash/saldo/:id
- 🌐 GET /infocash/historico/:id
- 🌐 GET /infocash/resumo/:id
- 🌐 GET /infocash/perfil/:id
- 🌐 GET /infocash/ranking
- 🌐 POST /infocash/conceder
- 🌐 GET /infocash/estatisticas
- 🌐 GET /infocash/periodo/:id

### 2️⃣ TESTE DAS APIs DA REDE SOCIAL (Via HTTP)
```bash
# Servidor deve estar rodando
node teste_apis_rede_social.js
```
**O que testa:**
- 🌐 POST /posts (Criar post)
- 🌐 GET /post/:id (Buscar post)
- 🌐 GET /posts/feed (Feed geral)
- 🌐 GET /posts/usuario/:id (Posts do usuário)
- 🌐 POST /post/:id/comentario (Comentar)
- 🌐 POST /post/:id/curtir (Curtir/Descurtir)
- 🌐 PUT /post/:id (Atualizar post)
- 🌐 DELETE /post/:id (Deletar post)

### 3️⃣ TESTES UNITÁRIOS COMPLETOS (Jest)
```bash
# InfoCash
npm test infocash

# Rede Social  
npm test rede-social

# Todos os testes
npm test
```
**O que testa:**
- 🧪 Testes unitários do DAO
- 🧪 Testes de integração das APIs
- 🧪 Testes de validação e erros
- 🧪 Simulação de triggers automáticos
- 🧪 Testes de performance
- 🧪 Testes de integridade de dados

## 🎯 Resultados Esperados

### ✅ SUCESSO - Você deve ver:
```
🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!
✅ Todas as funcionalidades do InfoCash estão funcionando
📊 Sistema pronto para uso em produção
```

### ❌ POSSÍVEIS ERROS:

#### Erro de Conexão com Banco
```
❌ ERRO: Connection refused
```
**Solução:** Verifique se o MySQL está rodando e as credenciais estão corretas

#### Erro de Tabelas Não Encontradas
```
❌ ERRO: Table 'tbl_infocash' doesn't exist
```
**Solução:** Execute o arquivo SQL com as tabelas do InfoCash

#### Erro de Usuário Não Encontrado
```
❌ ERRO: No user found with ID 1
```
**Solução:** Certifique-se que existe pelo menos um usuário na tabela tbl_usuario

#### Erro de Permissão (APIs)
```
❌ ERRO: 403 Forbidden
```
**Solução:** Alguns endpoints precisam de token de admin. Configure a autenticação ou teste sem auth

## 🔧 Configurações para Teste

### Alterar Usuário de Teste
Nos arquivos de teste, mude a variável:
```javascript
const USER_ID = 1; // Mude para o ID do seu usuário de teste
```

### Alterar URL da API
No arquivo `teste_apis_infocash.js`:
```javascript
const API_BASE_URL = 'http://localhost:3333'; // Mude a porta se necessário
```

### Configurar Token de Autenticação
Se precisar de autenticação, adicione o token:
```javascript
const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_AQUI'
};
```

## 📊 Dados de Teste

Os testes criam automaticamente transações de exemplo:
- **10 pontos** - Avaliação de estabelecimento
- **15 pontos** - Avaliação de produto em promoção  
- **5 pontos** - Cadastro de produto

## 🛠️ Solução de Problemas

### 1. Instalar Dependências Faltantes
```bash
npm install axios supertest jest
```

### 2. Verificar Configuração do Banco
```bash
# Teste a conexão manualmente
mysql -u root -p
USE db_infohub;
SHOW TABLES;
```

### 3. Executar SQL das Tabelas
```bash
mysql -u root -p db_infohub < database/novas_tabelas_carrinho_compras.sql
```

### 4. Criar Usuário de Teste
```sql
INSERT INTO tbl_usuario (nome, email, senha_hash, perfil) 
VALUES ('Teste InfoCash', 'teste@infocash.com', 'senha_hash', 'admin');
```

## 📈 Interpretação dos Resultados

### Saldo = 0
- Normal se for primeira execução
- O sistema começará a acumular pontos com o uso

### Histórico Vazio  
- Normal se não houve atividade ainda
- Os triggers automáticos criarão transações

### Erro de Performance
- Se consultas demoram mais que 5 segundos
- Verificar índices no banco de dados

### Inconsistência de Dados
- Se saldo não bate com histórico
- Executar recalculo manual do saldo

## 🎯 Próximos Passos Após os Testes

1. **Se tudo passou:** Sistema pronto para produção
2. **Se houve erros:** Corrigir e testar novamente
3. **Integração:** Conectar com o frontend
4. **Deploy:** Subir para servidor de produção

---

**💡 Dica:** Execute os testes sempre que fizer mudanças no código para garantir que nada quebrou!