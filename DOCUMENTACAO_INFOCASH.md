# Sistema InfoCash - Sistema de Pontos

## Visão Geral
O InfoCash é um sistema de pontos gamificado que recompensa usuários por interações específicas na plataforma InfoHub. Os usuários ganham pontos (InfoCash) por realizar atividades que agregam valor ao ecossistema.

## Como Ganhar Pontos

### Ações que Concedem Pontos:

1. **Avaliar Produto em Promoção** - 15 pontos
   - Quando um usuário avalia um produto que está em promoção ativa
   - Trigger automático após inserção na tabela `tbl_avaliacao`

2. **Avaliar Estabelecimento** - 10 pontos
   - Quando um usuário avalia qualquer estabelecimento
   - Trigger automático após inserção na tabela `tbl_avaliacao`

3. **Cadastrar Produto (Estabelecimentos)** - 5 pontos
   - Quando um estabelecimento cadastra um novo produto
   - Trigger automático após inserção na tabela `tbl_produto`

## Estrutura do Banco de Dados

### Tabelas Principais:

#### `tbl_infocash`
Armazena o histórico de todas as transações de pontos:
- `id_transacao`: ID único da transação
- `id_usuario`: ID do usuário que recebeu os pontos
- `tipo_acao`: Tipo da ação (avaliacao_promocao, avaliacao_empresa, cadastro_produto)
- `pontos`: Quantidade de pontos concedidos
- `descricao`: Descrição da ação realizada
- `data_transacao`: Data e hora da transação
- `referencia_id`: ID de referência (ID da avaliação, produto, etc.)

#### `tbl_saldo_infocash`
Armazena o saldo atual de cada usuário para consulta rápida:
- `id_usuario`: ID do usuário
- `saldo_total`: Saldo total atual de pontos
- `ultima_atualizacao`: Data da última atualização do saldo

### Views Úteis:

#### `vw_infocash_usuario`
Dashboard completo do usuário com estatísticas detalhadas de pontos

## API Endpoints

### Consultar Saldo
```
GET /infocash/saldo/:id
```
Retorna o saldo atual do usuário.

### Histórico de Transações
```
GET /infocash/historico/:id?limite=50
```
Retorna o histórico de transações do usuário.

### Resumo por Tipo de Ação
```
GET /infocash/resumo/:id
```
Retorna estatísticas agrupadas por tipo de ação.

### Perfil Completo
```
GET /infocash/perfil/:id
```
Retorna saldo e resumo em uma única consulta.

### Transações por Período
```
GET /infocash/periodo/:id?dataInicio=2023-01-01&dataFim=2023-12-31
```
Retorna transações filtradas por período.

### Ranking de Usuários
```
GET /infocash/ranking?limite=10
```
Retorna ranking dos usuários com mais pontos.

### Estatísticas Gerais (Admin)
```
GET /infocash/estatisticas
```
Retorna estatísticas gerais do sistema.

### Conceder Pontos Manualmente (Admin)
```
POST /infocash/conceder
{
  "id_usuario": 1,
  "tipo_acao": "avaliacao_promocao",
  "pontos": 15,
  "descricao": "Pontos de bônus",
  "referencia_id": 123
}
```

## Triggers Automáticos

### `tr_infocash_avaliacao_promocao`
- Acionado após inserção em `tbl_avaliacao`
- Verifica se é avaliação de produto em promoção (15 pontos)
- Verifica se é avaliação de estabelecimento (10 pontos)
- Atualiza automaticamente o saldo do usuário

### `tr_infocash_cadastro_produto`
- Acionado após inserção em `tbl_produto`
- Concede 5 pontos ao usuário responsável pelo estabelecimento
- Atualiza automaticamente o saldo do usuário

## Permissões de Acesso

### Usuário Comum:
- Consultar próprio saldo e histórico
- Visualizar ranking público
- Receber pontos automaticamente por ações

### Administrador:
- Consultar saldo/histórico de qualquer usuário
- Conceder pontos manualmente
- Visualizar estatísticas gerais do sistema
- Gerenciar configurações de pontos

### Estabelecimento:
- Consultar próprio saldo e histórico
- Receber pontos por cadastrar produtos

## Exemplos de Uso

### Consultar Saldo do Usuário
```javascript
// GET /infocash/saldo/1
{
  "status": true,
  "message": "Saldo InfoCash consultado com sucesso",
  "data": {
    "saldo_total": 45,
    "ultima_atualizacao": "2023-11-11T10:30:00.000Z"
  }
}
```

### Histórico de Transações
```javascript
// GET /infocash/historico/1
{
  "status": true,
  "message": "Histórico InfoCash consultado com sucesso",
  "data": [
    {
      "id_transacao": 1,
      "tipo_acao": "avaliacao_promocao",
      "pontos": 15,
      "descricao": "Pontos ganhos por avaliar produto em promoção",
      "data_transacao": "2023-11-11T09:15:00.000Z",
      "referencia_id": 123
    }
  ]
}
```

### Resumo por Tipo de Ação
```javascript
// GET /infocash/resumo/1
{
  "status": true,
  "message": "Resumo InfoCash consultado com sucesso",
  "data": [
    {
      "tipo_acao": "avaliacao_promocao",
      "total_transacoes": 2,
      "total_pontos": 30
    },
    {
      "tipo_acao": "avaliacao_empresa",
      "total_transacoes": 1,
      "total_pontos": 10
    }
  ]
}
```

## Configurações e Regras

### Valores de Pontos (podem ser ajustados):
- Avaliação de produto em promoção: 15 pontos
- Avaliação de estabelecimento: 10 pontos
- Cadastro de produto: 5 pontos

### Regras de Negócio:
- Pontos são concedidos automaticamente via triggers
- Não há expiração de pontos
- Não é possível transferir pontos entre usuários
- Administradores podem conceder pontos manualmente para casos especiais
- Histórico completo é mantido para auditoria

## Futuras Expansões

### Funcionalidades Planejadas:
- Sistema de resgate de pontos por benefícios
- Pontos por compartilhamento de produtos
- Multiplicadores de pontos em eventos especiais
- Níveis de usuário baseados em pontos acumulados
- Sistema de badges/conquistas

### Integrações Possíveis:
- Desconto em compras usando InfoCash
- Promoções exclusivas para usuários com muitos pontos
- Notificações push para marcos de pontos
- Relatórios detalhados para estabelecimentos

## Manutenção e Monitoramento

### Consultas Úteis:
```sql
-- Top 10 usuários com mais pontos
SELECT * FROM vw_infocash_usuario ORDER BY saldo_total DESC LIMIT 10;

-- Transações do último mês
SELECT * FROM tbl_infocash WHERE data_transacao >= DATE_SUB(NOW(), INTERVAL 1 MONTH);

-- Usuários que mais ganharam pontos hoje
SELECT id_usuario, SUM(pontos) as pontos_hoje 
FROM tbl_infocash 
WHERE DATE(data_transacao) = CURDATE() 
GROUP BY id_usuario 
ORDER BY pontos_hoje DESC;
```

### Backup e Segurança:
- Backup regular das tabelas `tbl_infocash` e `tbl_saldo_infocash`
- Log de todas as operações de concessão manual
- Validação de integridade entre histórico e saldos