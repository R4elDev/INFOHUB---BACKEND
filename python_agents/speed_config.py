# ⚡ CONFIGURAÇÕES DE PERFORMANCE PARA ACELERAR RESPOSTAS

# 🎯 CATEGORIAS DE PRODUTOS PARA BUSCA RÁPIDA
PRODUTO_CATEGORIAS = {
    'laticínios': ['leite', 'iogurte', 'queijo', 'manteiga', 'creme'],
    'higiene': ['shampoo', 'condicionador', 'sabonete', 'pasta', 'escova'],
    'limpeza': ['detergente', 'sabão', 'amaciante', 'desinfetante', 'alvejante'],
    'alimentos': ['arroz', 'feijão', 'açúcar', 'óleo', 'sal', 'farinha'],
    'bebidas': ['suco', 'refrigerante', 'água', 'cerveja', 'energético'],
    'padaria': ['pão', 'biscoito', 'bolo', 'torta', 'salgado'],
    'carnes': ['frango', 'carne', 'peixe', 'linguiça', 'presunto'],
    'farmácia': ['remédio', 'vitamina', 'protetor', 'band', 'álcool']
}

# 🔥 PALAVRAS-CHAVE ULTRA-RÁPIDAS PARA PROMOÇÕES
SPEED_PROMO_KEYWORDS = [
    'promoção', 'desconto', 'oferta', 'barato', 'preço', 'cupom', 
    'liquidação', 'sale', 'promoções', 'ofertas', 'descontos',
    'econômico', 'economia', 'menor preço', 'mais barato'
]

# 📍 PALAVRAS PARA LOCALIZAÇÃO RÁPIDA
LOCATION_KEYWORDS = [
    'perto', 'próximo', 'aqui', 'local', 'onde', 'distância', 
    'longe', 'cerca', 'região', 'bairro', 'endereço'
]

# ❓ PERGUNTAS FREQUENTES ULTRA-RÁPIDAS
SPEED_FAQ = {
    'oi': "👋 Olá! Sou seu assistente de promoções! Que produto você procura?",
    'olá': "👋 Olá! Sou seu assistente de promoções! Que produto você procura?",
    'ajuda': "💡 Diga o produto que procura: 'leite barato' ou 'farmácia perto'",
    'help': "💡 Diga o produto que procura: 'leite barato' ou 'farmácia perto'",
    'produtos': "🛍️ Temos: laticínios, higiene, limpeza, alimentos, bebidas, farmácia e mais!",
    'funciona': "🎯 Simples: diga o produto → vejo promoções → você economiza!"
}

# 🚫 ASSUNTOS FORA DO ESCOPO (RESPOSTA INSTANTÂNEA)
OFF_TOPIC_KEYWORDS = [
    'política', 'futebol', 'jogo', 'time', 'eleição', 'governo',
    'tempo', 'clima', 'chuva', 'sol', 'temperatura',
    'receita', 'culinária', 'cozinhar', 'preparo',
    'filme', 'série', 'novela', 'tv', 'cinema',
    'música', 'cantor', 'banda', 'show',
    'saúde', 'médico', 'hospital', 'doença',
    'piada', 'humor', 'engraçado', 'rir'
]

# ⚡ CONFIGURAÇÕES DO OLLAMA PARA VELOCIDADE
OLLAMA_SPEED_CONFIG = {
    "temperature": 0.1,     # Muito baixo = respostas mais rápidas
    "top_p": 0.8,          # Menos criatividade = mais velocidade  
    "num_predict": 100,    # Limita resposta a 100 tokens
    "repeat_penalty": 1.1, # Evita repetições
    "top_k": 20           # Menos opções = mais rápido
}

# 🎯 TIMEOUT CONFIGURAÇÕES
TIMEOUTS = {
    "ollama": 3.0,         # 3 segundos max para Ollama
    "database": 1.0,       # 1 segundo max para banco
    "fallback": 0.1        # 100ms para fallback
}