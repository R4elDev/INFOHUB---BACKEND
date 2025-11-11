# 🧪 Guia Completo do Sistema de Testes - InfoHub Backend

## 📋 Visão Geral

Este guia abrange o sistema completo de testes do InfoHub Backend, incluindo:
- Sistema InfoCash (Sistema de Pontos)
- Rede Social (Posts, Comentários, Likes)
- Testes de Performance e Integridade

## 🚀 Execução Rápida

### Teste Completo do Sistema
```bash
node teste_completo_sistema.js
```

### Testes Individuais
```bash
# InfoCash System
node teste_infocash.js

# Rede Social
node teste_rede_social.js

# APIs da Rede Social
node teste_apis_rede_social.js

# Testes Jest
npm test
```

## 📁 Estrutura dos Testes

### 1. Testes do Sistema InfoCash
**Arquivo**: `teste_infocash.js`
- ✅ Consulta de saldo de usuários
- ✅ Histórico de pontos
- ✅ Concessão manual de pontos
- ✅ Sistema de ranking
- ✅ Validação de integridade

### 2. Testes da Rede Social
**Arquivo**: `teste_rede_social.js`
- ✅ CRUD completo de Posts
- ✅ Sistema de Comentários
- ✅ Sistema de Likes
- ✅ Limpeza automática dos dados de teste

### 3. Testes de APIs da Rede Social
**Arquivo**: `teste_apis_rede_social.js`
- ✅ Autenticação com token
- ✅ Endpoints de Posts
- ✅ Endpoints de Comentários
- ✅ Endpoints de Likes
- ✅ Validação de respostas HTTP

### 4. Testes Jest (Unitários)
**Diretório**: `__tests__/`
- ✅ Testes unitários dos controllers
- ✅ Testes de middleware
- ✅ Testes de serviços
- ✅ Testes de integração

## 🎯 Sistema de Pontos InfoCash

### Como Funciona
O sistema InfoCash recompensa usuários automaticamente por:

| Ação | Pontos | Trigger |
|------|--------|---------|
| Avaliar Promoção | 15 pontos | Automático |
| Avaliar Estabelecimento | 10 pontos | Automático |
| Cadastrar Produto | 5 pontos | Automático |

### Endpoints da API
```
GET /infocash/saldo/:id_usuario          # Consultar saldo
GET /infocash/historico/:id_usuario      # Ver histórico
POST /infocash/conceder                  # Conceder pontos manual
GET /infocash/ranking                    # Ranking de usuários
GET /infocash/estatisticas              # Estatísticas gerais
```

## 🌐 Sistema de Rede Social

### Funcionalidades Testadas
- **Posts**: Criar, editar, listar, deletar
- **Comentários**: Adicionar, editar, remover
- **Likes**: Curtir/descurtir posts e comentários
- **Integridade**: Relacionamentos entre tabelas

### Endpoints da API
```
# Posts
GET /posts                    # Listar posts
POST /posts                   # Criar post
PUT /posts/:id               # Editar post
DELETE /posts/:id            # Deletar post

# Comentários
GET /posts/:id/comentarios   # Listar comentários
POST /posts/:id/comentarios  # Criar comentário
PUT /comentarios/:id         # Editar comentário
DELETE /comentarios/:id      # Deletar comentário

# Likes
POST /posts/:id/like         # Curtir post
DELETE /posts/:id/like       # Descurtir post
```

## 🔧 Configuração e Pré-requisitos

### 1. Banco de Dados
Certifique-se de que as tabelas estão criadas:
```sql
-- Execute o arquivo SQL
source database/novas_tabelas_carrinho_compras.sql;
```

### 2. Dependências
```bash
npm install jest supertest axios mysql2
```

### 3. Configuração do Ambiente
- Configure o arquivo `modulo/config.js` com suas credenciais do banco
- Certifique-se de que o servidor está rodando na porta 3000

## 📊 Interpretando os Resultados

### ✅ Teste Bem-sucedido
```
✅ [SUCESSO] Teste passou - funcionalidade OK
```

### ❌ Teste com Falha
```
❌ [ERRO] Teste falhou - verificar implementação
```

### ⚠️ Avisos
```
⚠️ [AVISO] Possível problema - investigar
```

## 🎛️ Menu Interativo

O arquivo `teste_completo_sistema.js` oferece um menu interativo:

```
🧪 === SISTEMA DE TESTES INFOHUB ===

1. ✅ Executar TODOS os testes
2. 🎯 Testar apenas InfoCash
3. 🌐 Testar apenas Rede Social
4. 🚀 Teste de Performance
5. 📊 Relatório de Saúde do Sistema
6. 🧹 Limpar dados de teste
0. Sair
```

## 🔍 Debugging e Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Banco**
   - Verifique as credenciais em `modulo/config.js`
   - Confirme se o MySQL está rodando

2. **Tabelas não Existem**
   - Execute o arquivo SQL: `database/novas_tabelas_carrinho_compras.sql`

3. **Servidor não Responde**
   - Confirme se `app.js` está rodando na porta 3000
   - Verifique se não há outros processos usando a porta

4. **Testes Falhando**
   - Execute os testes individualmente para identificar o problema
   - Verifique os logs detalhados

### Logs Detalhados
Para mais informações durante os testes, procure por:
- Detalhes das consultas SQL
- Respostas das APIs
- Stack traces de erros

## 📈 Performance e Otimização

### Métricas Monitoradas
- Tempo de resposta das APIs
- Uso de memória durante os testes
- Número de conexões simultâneas ao banco
- Taxa de sucesso dos testes

### Benchmarks Esperados
- APIs devem responder em < 200ms
- Operações no banco em < 100ms
- Taxa de sucesso > 95%

## 🚨 Alertas e Monitoramento

O sistema detecta automaticamente:
- Falhas de conectividade
- Degradação de performance
- Inconsistências nos dados
- Problemas de integridade referencial

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Execute o teste completo: `node teste_completo_sistema.js`
2. Analise os logs detalhados
3. Verifique a configuração do banco de dados
4. Confirme se todas as dependências estão instaladas

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0