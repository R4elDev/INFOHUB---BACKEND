# 🇧🇷 **Guia de Configuração - Stripe Brasil**

## 🎯 **Configuração do Stripe para InfoHub**

### **1. Instalação**
```bash
# Instalar dependência do Stripe
npm install stripe
```

### **2. Configuração das Variáveis de Ambiente**

Crie ou atualize o arquivo `.env`:
```bash
# STRIPE BRASIL - Chaves de Teste
STRIPE_SECRET_KEY=sk_test_51XXXXX...
STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXX...

# STRIPE BRASIL - Chaves de Produção (quando for para produção)
# STRIPE_SECRET_KEY=sk_live_51XXXXX...
# STRIPE_PUBLISHABLE_KEY=pk_live_51XXXXX...

# URLs para webhooks e redirecionamentos
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

### **3. Obter Chaves do Stripe**

1. **Acesse:** https://dashboard.stripe.com/register
2. **Crie conta** ou faça login
3. **Vá para:** Developers > API Keys
4. **Copie:**
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### **4. Configurar Webhooks (Opcional - Para Produção)**

1. **No Dashboard Stripe:** Developers > Webhooks
2. **Adicionar endpoint:** `https://seudominio.com/v1/infohub/webhook/stripe`
3. **Eventos para escutar:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

---

## 💳 **Métodos de Pagamento Suportados**

### **✅ Cartão de Crédito/Débito**
- Visa, Mastercard, Elo, Amex
- Processamento em tempo real
- Confirmação imediata

### **✅ PIX**
- QR Code gerado automaticamente
- Expiração configurável
- Confirmação via webhook

### **⏳ Boleto (Futuro)**
- Pode ser implementado posteriormente
- Integração similar ao PIX

---

## 🧪 **Testando a Integração**

### **Cartões de Teste (Stripe)**
```javascript
// CARTÕES QUE SEMPRE APROVAM
{
  "numero": "4242424242424242",  // Visa
  "mes_vencimento": "12",
  "ano_vencimento": "2030",
  "cvv": "123"
}

{
  "numero": "5555555555554444",  // Mastercard  
  "mes_vencimento": "12",
  "ano_vencimento": "2030",
  "cvv": "123"
}

// CARTÃO QUE SEMPRE FALHA
{
  "numero": "4000000000000002",
  "mes_vencimento": "12", 
  "ano_vencimento": "2030",
  "cvv": "123"
}
```

### **Teste de PIX**
```bash
# Gerar PIX de teste
curl -X POST http://localhost:8080/v1/infohub/compra/carrinho \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_estabelecimento": 2,
    "metodo_pagamento": "pix",
    "email_cliente": "teste@email.com"
  }'
```

---

## 🔧 **Implementação no Controller**

Atualizar o `compraController.js` para passar o email do cliente:

```javascript
// Em processarCompraCarrinho
const { id_usuario, id_estabelecimento, metodo_pagamento, dados_cartao } = dadosCompra;

// Buscar dados do usuário para o email
const usuarioDAO = require('../../model/DAO/usuario.js');
const usuario = await usuarioDAO.selectUsuarioById(id_usuario);

if (!usuario) {
    return {
        status: false,
        status_code: 404,
        message: "Usuário não encontrado."
    };
}

// Passar email para o service
const dadosCompraCompleta = {
    id_usuario,
    id_estabelecimento,
    valor_total: valorTotal,
    metodo_pagamento,
    dados_cartao,
    email_cliente: usuario.email,  // ← ADICIONAR ESTA LINHA
    status_compra: 'pendente'
};
```

---

## 📊 **Fluxos de Pagamento**

### **🔄 Fluxo Cartão de Crédito**
1. Cliente informa dados do cartão
2. Stripe processa pagamento instantaneamente
3. Retorna aprovado/negado imediatamente
4. Compra confirmada se aprovado

### **🔄 Fluxo PIX**  
1. Cliente escolhe PIX
2. Sistema gera QR Code via Stripe
3. Cliente paga via app do banco
4. Stripe confirma pagamento via webhook
5. Sistema atualiza status da compra

### **🔄 Fluxo Dinheiro/Balcão**
1. Cliente escolhe pagamento local
2. Compra fica como 'pendente'
3. Estabelecimento confirma recebimento manualmente
4. Admin atualiza status para 'confirmada'

---

## ⚡ **Vantagens do Stripe Brasil**

### **✅ Benefícios**
- **Taxas competitivas:** 3.4% + R$0,40 por transação
- **PIX incluso:** Sem taxa adicional para PIX
- **Interface amigável:** Dashboard muito intuitivo
- **Documentação excelente:** APIs bem documentadas
- **Suporte internacional:** Empresa consolidada
- **Webhooks confiáveis:** Notificações automáticas

### **📈 Estatísticas**
- **Aprovação:** ~95% das transações aprovadas
- **Velocidade:** Processamento em <2 segundos
- **Disponibilidade:** 99.9% de uptime
- **Segurança:** PCI DSS Level 1 compliant

---

## 🚨 **Configurações de Segurança**

### **Environment Variables**
```bash
# NUNCA commitar as chaves no código!
# Sempre usar variáveis de ambiente

# Desenvolvimento
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...

# Produção  
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
```

### **Validações Adicionais**
```javascript
// Validar dados do cartão antes de enviar para Stripe
const validarCartao = (dados_cartao) => {
    const { numero, cvv, mes_vencimento, ano_vencimento } = dados_cartao;
    
    if (!numero || numero.length < 13 || numero.length > 19) {
        return { valid: false, message: "Número do cartão inválido" };
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
        return { valid: false, message: "CVV inválido" };
    }
    
    const mes = parseInt(mes_vencimento);
    const ano = parseInt(ano_vencimento);
    const agora = new Date();
    
    if (mes < 1 || mes > 12) {
        return { valid: false, message: "Mês de vencimento inválido" };
    }
    
    if (ano < agora.getFullYear()) {
        return { valid: false, message: "Cartão vencido" };
    }
    
    return { valid: true };
};
```

---

## 🎉 **Pronto para Usar!**

Com essa configuração, seu InfoHub terá:

- ✅ **Pagamentos reais** via Stripe Brasil
- ✅ **PIX funcionando** com QR Code
- ✅ **Cartões processados** em tempo real  
- ✅ **Fallback para simulação** se não configurado
- ✅ **Webhooks preparados** para confirmação automática
- ✅ **Segurança robusta** com validações

**Próximo passo:** Configure suas chaves do Stripe e teste com os cartões de exemplo!