import os

# ========= CONFIGURAÇÃO DO MODELO =========
MODEL = os.getenv("MODEL", "phi3:mini")  # modelo padrão para Ollama - Phi3 mini é mais leve

# ========= MENSAGENS DE SISTEMA =========
SYSTEM_MESSAGE = """
Você é o ASSISTENTE OFICIAL do InfoHub - a plataforma líder em descoberta de promoções no Brasil.

🎯 SUA MISSÃO:
- Ajudar usuários a encontrar as MELHORES PROMOÇÕES próximas a eles
- Responder dúvidas sobre como usar o InfoHub
- Fornecer dicas de economia e comparação de preços
- Ser educado, útil e sempre focado em ECONOMIA e PROMOÇÕES

🚫 O QUE VOCÊ NÃO FAZ:
- Não responde sobre outros temas (política, esporte, entretenimento, etc.)
- Não dá conselhos médicos, legais ou financeiros complexos
- Não fala sobre concorrentes ou outras plataformas
- Se perguntado sobre algo fora do escopo, diga: "Sou especialista em promoções do InfoHub. Como posso ajudar você a economizar hoje?"

🛍️ COMO RESPONDER A PEDIDOS DE PROMOÇÕES:
Para QUALQUER pedido de promoção, SEMPRE use a ferramenta:
<tool>{{"name":"best_promotions","args":{{"promotions_data":[dados_recebidos],"termo_busca":"produto","user_id":id_usuario}}}}</tool>

📋 INFORMAÇÕES QUE VOCÊ DOMINA:
- Como o InfoHub funciona (busca promoções por localização e preço)
- Produtos disponíveis: leite, iogurte, suco, shampoo, detergente, arroz, feijão, açúcar, óleo, etc.
- Como cadastrar endereço no perfil para melhores resultados
- Diferenças entre estabelecimentos (preço vs proximidade)
- Dicas para economizar nas compras

💬 TOM DE COMUNICAÇÃO:
- Amigável e prestativo
- Use emojis para deixar mais visual (🛒💰📍📅)
- Linguagem clara e direta
- Sempre focado em ajudar a ECONOMIZAR DINHEIRO

🔧 FERRAMENTAS DISPONÍVEIS:
- best_promotions: Para buscar promoções reais no banco de dados
- faq_answer: Para responder dúvidas sobre o sistema

📝 FORMATO DE RESPOSTA:
Para usar ferramentas:
<tool>{{"name":"FERRAMENTA","args":{{parâmetros}}}}</tool>

Para resposta final:
<final>Sua resposta completa aqui</final>

EXEMPLOS DE COMO RESPONDER:

Usuário: "quero leite barato"
Você: <tool>{{"name":"best_promotions","args":{{"termo_busca":"leite"}}}}</tool>

Usuário: "como funciona o app?"
Você: <final>O InfoHub encontra as melhores promoções perto de você! 🛍️ Cadastre seu endereço no perfil e peça por produtos como "quero promoções de leite". Mostramos preço, distância e validade. Simples assim! 💰</final>

Usuário: "me fale sobre futebol"
Você: <final>Sou especialista em promoções do InfoHub. Como posso ajudar você a economizar hoje? 🛒 Que tal buscar ofertas de algum produto?</final>

LEMBRE-SE: Seu objetivo é ser o MELHOR assistente de promoções do Brasil! 🏆
"""

# ========= PALAVRAS-CHAVE =========
PROMO_KEYWORDS = [
    # Promoções diretas
    "promoção", "promocoes", "promoções", "promo", "promos",
    
    # Descontos e ofertas
    "desconto", "descontos", "oferta", "ofertas", "liquidação",
    
    # Preços
    "preço", "preco", "preços", "precos", "barato", "barata", "baratos", "baratas",
    "melhor preço", "menor preço", "mais barato", "em conta",
    
    # Ações de busca
    "quero", "buscar", "procurar", "encontrar", "achar", "preciso",
    "tem", "há", "existe", "onde", "qual", "como encontrar",
    
    # Economia
    "economizar", "economia", "poupar", "gastar menos", "pagar menos",
    
    # Comparação
    "comparar", "comparação", "melhor", "melhores", "top",
    
    # Estabelecimentos
    "supermercado", "farmácia", "loja", "mercado", "atacado",
    
    # Produtos específicos
    "comprar", "produto", "produtos", "item", "itens"
]

# ========= FAQ EXPANDIDO =========
FAQ = {
    # Sobre o sistema
    "o que é o infohub": "O InfoHub é a maior plataforma de descoberta de promoções do Brasil! 🇧🇷 Encontramos as melhores ofertas perto de você, comparando preços e distâncias em tempo real.",
    
    "como funciona": "Simples! 1️⃣ Você cadastra seu endereço no perfil 2️⃣ Pede por produtos ('quero leite barato') 3️⃣ Mostramos as melhores ofertas ordenadas por preço e proximidade 4️⃣ Você economiza! 💰",
    
    "como escolhem as promocoes": "Usamos algoritmos inteligentes que filtram promoções válidas, calculam distância do seu endereço e ordenam por melhor custo-benefício (menor preço + menor distância).",
    
    # Localização
    "como informar minha localizacao": "Vá no seu perfil e cadastre um endereço completo. Assim conseguimos mostrar promoções próximas a você! 📍 Sem endereço, não conseguimos calcular distâncias.",
    
    "preciso dar minha localização": "Para melhores resultados, sim! 🎯 Cadastre seu endereço no perfil. Não pedimos coordenadas GPS, apenas o endereço para calcular distâncias das lojas.",
    
    # Produtos e categorias
    "que produtos vocês têm": "Temos promoções de: 🥛 Laticínios (leite, iogurte), 🧴 Higiene (shampoo, detergente), 🍚 Alimentos (arroz, feijão, açúcar, óleo), 🧃 Bebidas (sucos) e muito mais!",
    
    "como filtrar por categoria": "Basta pedir pelo tipo: 'quero promoções de laticínios' ou produtos específicos: 'buscar shampoo barato'. Nosso sistema entende linguagem natural! 🤖",
    
    # Estabelecimentos
    "que lojas vocês cobrem": "Trabalhamos com supermercados, farmácias, atacados e mercados regionais. Sempre expandindo nossa rede para você ter mais opções! 🏪",
    
    "como escolher entre preço e distância": "Mostramos ambos! 💡 Dica: promoções muito baratas podem valer a pena mesmo se mais longe. Você decide o que compensa mais!",
    
    # Funcionalidades
    "como pesquisar": "Use linguagem natural! 💬 'quero leite barato', 'onde tem desconto de shampoo', 'melhor preço de arroz'. Quanto mais específico, melhor!",
    
    "posso comparar preços": "Claro! 📊 Mostramos várias opções ordenadas por preço, então você já vê a comparação automática. Sempre com preços reais e atualizados.",
    
    # Economia
    "como economizar mais": "💡 Dicas: 1️⃣ Cadastre endereço para ver ofertas próximas 2️⃣ Compare preço vs distância 3️⃣ Confira validade das promoções 4️⃣ Aproveite para comprar mais itens na mesma loja!",
    
    # Problemas comuns
    "não encontrei promoções": "Pode ser que: 🔍 Não há ofertas válidas no momento 📍 Você não cadastrou endereço 🏪 Não temos parcerias na sua região ainda. Tente outros produtos!",
    
    "promoções vencidas": "Sempre filtramos por validade! 📅 Se apareceu, está válida. Mas corre lá que promoção boa não dura muito! ⏰",
    
    # Escopo
    "foco": "Sou especialista em promoções do InfoHub! 🛍️ Não respondo sobre outros temas. Como posso ajudar você a economizar hoje?",
    
    "outros assuntos": "Sou focado em ajudar você a encontrar as melhores promoções! 🎯 Para outros assuntos, que tal buscar uma oferta de algum produto que você precisa? 😊"
}
