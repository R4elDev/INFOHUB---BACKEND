"""
⚡ AGENTE SEM OLLAMA - RESPOSTA INSTANTÂNEA
Sistema de lógica pura para respostas em < 50ms
"""

import time
import re
from typing import Dict, Any, Optional
import tools
import speed_config

# Cache global para respostas
RESPONSE_CACHE = {}
STATS = {"total_requests": 0, "cache_hits": 0, "avg_response_time": 0}

def lightning_agent(user_msg: str, session_id: str, promotions_data: Optional[list] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    ⚡ AGENTE RELÂMPAGO - ZERO IA, PURA LÓGICA
    Target: 100% das respostas em < 100ms
    """
    start_time = time.time()
    STATS["total_requests"] += 1
    
    try:
        # 💾 Cache check ultra-rápido
        cache_key = f"{user_msg.lower().strip()}_{user_id or 0}"
        if cache_key in RESPONSE_CACHE:
            STATS["cache_hits"] += 1
            response = RESPONSE_CACHE[cache_key].copy()
            response_time = int((time.time() - start_time) * 1000)
            response["metadata"]["response_time_ms"] = response_time
            response["metadata"]["cached"] = True
            return response
        
        # 🎯 Sistema de regras ultra-rápido
        response = process_message_lightning(user_msg, promotions_data, user_id)
        
        # Adiciona metadados
        response_time = int((time.time() - start_time) * 1000)
        response["metadata"]["response_time_ms"] = response_time
        response["metadata"]["cached"] = False
        response["metadata"]["agent"] = "lightning"
        
        # Cacheia respostas muito rápidas
        if response_time < 50 and response["confidence"] > 0.8:
            RESPONSE_CACHE[cache_key] = response.copy()
        
        # Atualiza estatísticas
        STATS["avg_response_time"] = (STATS["avg_response_time"] + response_time) / 2
        
        return response
        
    except Exception as e:
        response_time = int((time.time() - start_time) * 1000)
        return {
            "reply": "🤔 Ops! Pode repetir sua pergunta de forma mais simples?",
            "toolsUsed": [],
            "confidence": 0.5,
            "metadata": {"error": str(e), "response_time_ms": response_time, "agent": "lightning_error"}
        }

def process_message_lightning(user_msg: str, promotions_data: Optional[list] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    🧠 PROCESSAMENTO HÍBRIDO
    Usa cache + regras + classificador phi-2
    """
    from intent_classifier import classify_intent
    
    user_msg_clean = user_msg.lower().strip()
    words = user_msg_clean.split()
    
    # 🎯 1. Extrai produto se existir
    produto = tools.extract_search_term(user_msg)
    
    # 🤖 2. Classifica intenção com phi-2
    intent, confidence = classify_intent(user_msg_clean)
    
    # 🎯 3. Processa baseado na intenção
    
    if intent == "saudacao":
        return {
            "reply": "👋 Oi! Sou seu assistente de promoções do InfoHub! 🛍️\n\n💬 **Como usar:**\n• 'leite barato'\n• 'farmácia perto'\n• 'promoções de arroz'\n\nQue produto você procura? 😊",
            "toolsUsed": ["classifier"],
            "confidence": confidence,
            "metadata": {"type": "greeting", "intent": intent}
        }
    
    if intent == "como_funciona_chat":
        return {
            "reply": "💬 **Como conversar comigo:**\n\n🤖 **Sou um assistente inteligente para encontrar promoções!**\n\n**📝 Exemplos do que posso fazer:**\n• 'oi' → Te cumprimento\n• 'leite barato' → Busco promoções de leite\n• 'quais as promoções?' → Listo as melhores ofertas perto de você\n• 'melhores preços por perto' → Foco em ofertas próximas\n• 'que produtos têm?' → Mostro catálogo\n\n**💡 Dicas para conversar:**\n✅ Seja direto: 'arroz em promoção'\n✅ Use localização: 'farmácia perto'\n✅ Pergunte livremente: sou rápido e inteligente!\n\n**🎯 Objetivo:** Te ajudar a economizar encontrando as melhores ofertas! 😊",
            "toolsUsed": ["classifier"],
            "confidence": confidence,
            "metadata": {"type": "chat_tutorial", "intent": intent}
        }
        
    if intent == "ajuda":
        return {
            "reply": "� **Como funciona o InfoHub:**\n\n🎯 **1.** Diga o produto: 'leite barato'\n📍 **2.** Cadastre seu endereço no perfil\n🔍 **3.** Vejo preço, distância e validade\n💰 **4.** Você economiza com as melhores ofertas!\n\n**Experimente:** 'quero promoções de arroz' �",
            "toolsUsed": ["classifier"],
            "confidence": confidence,
            "metadata": {"type": "how_it_works", "intent": intent}
        }
        
    if intent == "catalogo":
        return {
            "reply": "🛍️ **Produtos no InfoHub:**\n\n🥛 **Laticínios:** leite, iogurte, queijo\n🧴 **Higiene:** shampoo, condicionador, sabonete\n🍚 **Alimentos:** arroz, feijão, açúcar, óleo\n🧽 **Limpeza:** detergente, sabão, amaciante\n🧃 **Bebidas:** sucos, refrigerantes\n💊 **Farmácia:** remédios, vitaminas\n\n💬 **Exemplos:** 'leite barato', 'shampoo em promoção'\n\nQual produto posso buscar para você? 😊",
            "toolsUsed": ["classifier"],
            "confidence": confidence,
            "metadata": {"type": "product_catalog", "intent": intent}
        }
    
    if intent == "melhor_preco_local":
        if not produto:
            return {
                "reply": "🏆 Quer te mostrar as melhores promoções por perto!\n\nMe diga o produto (ex.: leite, arroz, shampoo) para eu buscar as opções mais baratas próximas de você.",
                "toolsUsed": ["classifier"],
                "confidence": confidence,
                "metadata": {"type": "ask_product_for_nearby", "intent": intent}
            }
        try:
            promotions_near = tools.find_promotions(user_msg, user_id)
            if promotions_near:
                return {
                    "reply": format_best_nearby(promotions_near, produto),
                    "toolsUsed": ["classifier", "find_promotions"],
                    "confidence": confidence,
                    "metadata": {"type": "best_nearby", "intent": intent, "product": produto, "found": len(promotions_near)}
                }
            else:
                return {
                    "reply": f"😔 Não encontrei promoções de **{produto}** perto de você agora.\n\n💡 Dicas:\n• Verifique se cadastrou seu endereço\n• Tente outro produto (ex.: arroz, leite, shampoo)\n• Use termos simples",
                    "toolsUsed": ["classifier", "find_promotions"],
                    "confidence": confidence * 0.9,
                    "metadata": {"type": "no_nearby_promotions", "intent": intent, "product": produto}
                }
        except Exception as e:
            return {
                "reply": "🤔 Tive um problema ao buscar as melhores promoções por perto. Pode tentar de novo em instantes?",
                "toolsUsed": ["classifier"],
                "confidence": confidence * 0.7,
                "metadata": {"type": "best_nearby_error", "intent": intent, "error": str(e)}
            }
    
    if intent == "promocoes_gerais":
        try:
            from tools import find_nearby_promotions
            promotions_nearby = find_nearby_promotions(user_id)
            if promotions_nearby:
                return {
                    "reply": format_general_promotions(promotions_nearby),
                    "toolsUsed": ["classifier", "find_nearby_promotions"],
                    "confidence": confidence,
                    "metadata": {"type": "general_promotions", "intent": intent, "found": len(promotions_nearby)}
                }
            else:
                return {
                    "reply": "😔 Não encontrei promoções ativas perto de você no momento.\n\n💡 **Dicas:**\n• Verifique se cadastrou seu endereço no perfil\n• Tente buscar um produto específico: 'leite barato'\n• Verifique se há estabelecimentos na sua região\n\nQue produto específico posso buscar para você? 🛍️",
                    "toolsUsed": ["classifier", "find_nearby_promotions"],
                    "confidence": confidence * 0.8,
                    "metadata": {"type": "no_general_promotions", "intent": intent}
                }
        except Exception as e:
            return {
                "reply": "🤔 Tive um problema ao buscar as promoções. Pode tentar de novo em instantes ou me dizer um produto específico?",
                "toolsUsed": ["classifier"],
                "confidence": confidence * 0.7,
                "metadata": {"type": "general_promotions_error", "intent": intent, "error": str(e)}
            }
    
    if intent == "local":
        if not produto:
            return {
                "reply": "📍 **Para resultados próximos a você:**\n\n✅ Cadastre seu endereço no seu perfil\n🎯 Use: 'produto + perto' (ex: 'farmácia perto')\n📱 Ative localização se solicitado\n\n💡 **Exemplo:** 'leite perto de mim'\n\nQue produto você procura próximo a você? 😊",
                "toolsUsed": ["classifier"],
                "confidence": confidence,
                "metadata": {"type": "location_help", "intent": intent}
            }
        # Se tem produto, trata como promoção
        intent = "promocao"
    
    if intent == "promocao" or (intent == "outro" and produto):
        try:
            promotions = tools.find_promotions(user_msg, user_id)
            if promotions:
                return {
                    "reply": format_promotions_instant(promotions, produto),
                    "toolsUsed": ["classifier", "find_promotions"],
                    "confidence": confidence,
                    "metadata": {"type": "promotion_search", "intent": intent, "product": produto, "found": len(promotions)}
                }
            else:
                return {
                    "reply": f"😔 Não encontrei promoções de **{produto}** no momento.\n\n💡 **Dicas:**\n• Verifique se cadastrou seu endereço\n• Tente: 'leite', 'arroz', 'shampoo'\n• Use palavras simples\n\nQue outro produto posso buscar? 🛍️",
                    "toolsUsed": ["classifier", "find_promotions"],
                    "confidence": confidence * 0.9,
                    "metadata": {"type": "no_promotions", "intent": intent, "product": produto}
                }
        except Exception as search_error:
            return {
                "reply": f"🔍 Procurando **{produto}**... \n\nEnquanto isso, algumas **dicas rápidas:**\n• Cadastre seu endereço para resultados próximos\n• Use termos simples: 'leite barato'\n• Confira se o produto está disponível\n\nTente novamente em instantes! 😊",
                "toolsUsed": ["classifier"],
                "confidence": confidence * 0.7,
                "metadata": {"type": "search_error", "intent": intent, "product": produto, "error": str(search_error)}
            }
    
    # Fallback para outros casos
    return {
        "reply": "🤔 Não entendi exatamente o que você procura.\n\n💬 **Tente algo como:**\n• 'leite barato'\n• 'farmácia perto'\n• 'promoções de arroz'\n• 'que produtos têm'\n\nEstou aqui para ajudar! 😊",
        "toolsUsed": ["classifier"],
        "confidence": confidence,
        "metadata": {"type": "unknown", "intent": intent}
    }

def extract_product_ultra_fast(user_msg_clean: str) -> str:
    """
    🎯 EXTRAÇÃO ULTRA-RÁPIDA DE PRODUTO
    Usa lookup table para velocidade máxima
    """
    # Busca em todas as categorias de uma vez
    for produtos in speed_config.PRODUTO_CATEGORIAS.values():
        for produto in produtos:
            if produto in user_msg_clean:
                return produto
    
    # Busca palavras que podem ser produtos (não stop words)
    stop_words = {'de', 'da', 'do', 'para', 'com', 'sem', 'por', 'em', 'na', 'no', 'a', 'o', 'e', 'ou', 'que', 'quero', 'buscar', 'encontrar', 'ver', 'tem', 'há', 'existe', 'barato', 'caro', 'promoção', 'desconto', 'oferta', 'perto', 'longe', 'próximo'}
    
    words = user_msg_clean.split()
    for word in words:
        if len(word) > 3 and word not in stop_words:
            return word
    
    return "produto"

def format_promotions_instant(promotions: list, produto: str) -> str:
    """
    📝 FORMATAÇÃO INSTANTÂNEA DE PROMOÇÕES
    Formato otimizado para velocidade de leitura
    """
    count = len(promotions)
    
    if count == 0:
        return f"😔 Nenhuma promoção de **{produto}** encontrada."
    
    if count == 1:
        p = promotions[0]
        return f"🛒 **Encontrei {produto}!**\n\n• **{p.get('produto', produto)}** no **{p.get('estabelecimento', 'estabelecimento')}**\n💰 **{p.get('preco_brl', 'R$ --')}** • 📍 **{p.get('distance_km', '--')} km** • 📅 até **{p.get('data_fim', 'data')}**\n\n🎯 Quer mais opções? Peça!"
    
    # Múltiplas promoções - formato compacto
    result = f"🛒 **{count} promoções de {produto}!**\n\n"
    
    for i, p in enumerate(promotions[:3], 1):
        result += f"**{i}.** {p.get('produto', produto)} - {p.get('estabelecimento', '')}\n"
        result += f"    💰 {p.get('preco_brl', 'R$ --')} • 📍 {p.get('distance_km', '--')} km\n\n"
    
    if count > 3:
        result += f"...e mais **{count-3}** opções!\n\n"
    
    result += "💡 Ordenado por preço e proximidade!"
    return result

def format_general_promotions(promotions: list) -> str:
    """
    🛍️ Formata lista geral de promoções próximas (sem produto específico)
    """
    count = len(promotions)
    if count == 0:
        return "😔 Nenhuma promoção encontrada perto de você."

    header = f"🛍️ **{count} promoções ativas perto de você:**\n\n"
    body = ""
    
    for i, p in enumerate(promotions[:5], 1):
        produto = p.get('produto', 'Produto')
        estabelecimento = p.get('estabelecimento', 'Estabelecimento')
        preco = p.get('preco_brl', 'R$ --')
        distancia = p.get('distance_km', '--')
        data_fim = p.get('data_fim', 'data')
        
        body += f"**{i}.** {produto}\n"
        body += f"    🏪 {estabelecimento}\n"
        body += f"    💰 {preco} • 📍 {distancia} km • 📅 até {data_fim}\n\n"

    footer = "💡 **Quer algo específico?** Peça: 'leite barato' ou 'shampoo perto'"
    return header + body + footer

def format_best_nearby(promotions: list, produto: str) -> str:
    """
    🏆 Formata a resposta destacando que são as melhores promoções perto do usuário
    """
    count = len(promotions)
    if count == 0:
        return f"😔 Nenhuma promoção de **{produto}** encontrada perto de você."

    header = f"🏆 Melhores promoções de {produto} perto de você\n\n"
    body = ""
    for i, p in enumerate(promotions[:3], 1):
        body += f"**{i}.** {p.get('produto', produto)} - {p.get('estabelecimento', '')}\n"
        body += f"    💰 {p.get('preco_brl', 'R$ --')} • 📍 {p.get('distance_km', '--')} km\n\n"

    if count > 3:
        body += f"...e mais **{count-3}** opções!\n\n"

    footer = "💡 Ordenado por menor preço (desempate por proximidade)."
    return header + body + footer

def get_lightning_stats():
    """📊 Estatísticas do agente relâmpago"""
    cache_hit_rate = (STATS["cache_hits"] / max(STATS["total_requests"], 1)) * 100
    
    return {
        "agent": "lightning (no AI)",
        "total_requests": STATS["total_requests"],
        "cache_hits": STATS["cache_hits"],
        "cache_hit_rate": f"{cache_hit_rate:.1f}%",
        "cache_size": len(RESPONSE_CACHE),
        "avg_response_time_ms": f"{STATS['avg_response_time']:.1f}",
        "target_time": "< 100ms",
        "ai_usage": "0% (pure logic)"
    }