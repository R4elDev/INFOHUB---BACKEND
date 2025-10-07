"""
🤖 CLASSIFICADOR DE INTENÇÕES COM PHI-2
Sistema híbrido que usa LLM leve para classificação
"""

import requests
import json
from typing import Tuple, Dict, Any
import time

# Configuração do Ollama
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "tinydolphin:1.1b"  # Modelo mais leve e rápido (636MB)

# Cache de classificações para performance
INTENT_CACHE = {}

# Categorias de intenção possíveis
INTENT_CATEGORIES = {
    "saudacao": {
        "confidence": 0.95,
        "requires_product": False
    },
    "como_funciona_chat": {
        "confidence": 0.92,
        "requires_product": False
    },
    "ajuda": {
        "confidence": 0.90,
        "requires_product": False
    },
    "catalogo": {
        "confidence": 0.90,
        "requires_product": False
    },
    "melhor_preco_local": {
        "confidence": 0.85,
        "requires_product": True
    },
    "promocoes_gerais": {
        "confidence": 0.90,
        "requires_product": False
    },
    "promocao": {
        "confidence": 0.85,
        "requires_product": True
    },
    "outro": {
        "confidence": 0.50,
        "requires_product": False
    }
}

def classify_intent(text: str) -> Tuple[str, float]:
    """
    Classifica a intenção do texto usando regras + LLM híbrido
    Retorna (intent_name, confidence)
    """
    text_clean = text.lower().strip()
    
    # Verifica cache primeiro
    if text_clean in INTENT_CACHE:
        return INTENT_CACHE[text_clean]
    
    # 🚀 CLASSIFICAÇÃO RÁPIDA COM REGRAS (0ms)
    
    # Saudações (alta confiança)
    if any(w in text_clean for w in ['oi', 'olá', 'ola', 'hey', 'hello', 'bom dia', 'boa tarde', 'boa noite']):
        result = ("saudacao", 0.95)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Como funciona o chat (específico sobre funcionamento do chat/bot)
    if any(w in text_clean for w in ['como funciona o chat', 'como funciona esse chat', 'como usar o chat', 'como conversar', 'como falar com você', 'como te usar', 'como usar esse bot', 'como funciona este bot']):
        result = ("como_funciona_chat", 0.92)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Ajuda (alta confiança)
    if any(w in text_clean for w in ['como funciona', 'ajuda', 'help', 'o que você faz', 'quem é você']):
        result = ("ajuda", 0.90)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Catálogo (alta confiança)
    if any(w in text_clean for w in ['produtos', 'catálogo', 'tipos', 'categorias', 'tem']):
        result = ("catalogo", 0.90)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Melhor preço local (combinação específica)
    best_words = ['melhor', 'melhores', 'top', 'mais barato', 'menor preço']
    local_words = ['perto', 'próximo', 'aqui perto', 'por perto']
    if any(b in text_clean for b in best_words) and any(l in text_clean for l in local_words):
        result = ("melhor_preco_local", 0.85)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Localização
    if any(w in text_clean for w in ['perto', 'próximo', 'onde', 'localização', 'endereço']):
        result = ("local", 0.80)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Promoções gerais (quando pergunta "quais as promoções?" sem produto)
    promocoes_gerais = ['quais as promoções', 'que promoções', 'promoções disponíveis', 'promoções perto', 'ofertas disponíveis', 'quais ofertas', 'ofertas perto de mim', 'ofertas próximas', 'quais são suas promoções', 'suas promoções', 'as promoções']
    if any(pg in text_clean for pg in promocoes_gerais):
        result = ("promocoes_gerais", 0.90)
        INTENT_CACHE[text_clean] = result
        return result
    
    # Promoções (palavras-chave)
    if any(w in text_clean for w in ['promoção', 'desconto', 'oferta', 'barato', 'preço', 'cupom']):
        result = ("promocao", 0.85)
        INTENT_CACHE[text_clean] = result
        return result
    
    # 🤖 LLM APENAS PARA CASOS AMBÍGUOS (backup)
    try:
        # Prompt ultra-simples
        prompt = f"Categorize: {text_clean}\nOptions: saudacao,ajuda,catalogo,promocao,local,outro\nAnswer:"

        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0,
                "top_p": 0.1,
                "num_predict": 3,
                "num_ctx": 64
            }
        }

        start_time = time.time()
        response = requests.post(OLLAMA_URL, json=payload, timeout=1.0)
        response_time = time.time() - start_time
        
        if response.status_code == 200 and response_time < 1.0:
            result_text = response.json()['response'].strip().lower()
            
            # Mapeia resultado
            for category in INTENT_CATEGORIES:
                if category in result_text:
                    confidence = INTENT_CATEGORIES[category]["confidence"] * 0.8  # Reduz por ser LLM
                    result = (category, confidence)
                    INTENT_CACHE[text_clean] = result
                    return result
    except:
        pass  # Ignora erros do LLM
    
    # 📦 FALLBACK FINAL - sempre rápido
    result = ("outro", 0.5)
    INTENT_CACHE[text_clean] = result
    return result

def get_stats() -> Dict[str, Any]:
    """Retorna estatísticas do classificador"""
    return {
        "model": MODEL,
        "cache_size": len(INTENT_CACHE),
        "categories": list(INTENT_CATEGORIES.keys())
    }

def clear_cache():
    """Limpa o cache de classificações"""
    INTENT_CACHE.clear()