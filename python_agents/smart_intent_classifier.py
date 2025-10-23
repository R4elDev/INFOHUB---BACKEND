"""
🧠 CLASSIFICADOR INTELIGENTE DE INTENÇÕES
Sistema híbrido que combina regras rápidas + LLM para casos complexos
"""

import re
import time
from typing import Dict, Any, Tuple, Optional
import asyncio
from llm_manager import llm_manager

class SmartIntentClassifier:
    def __init__(self):
        self.intent_cache = {}
        self.quick_patterns = self._initialize_quick_patterns()
        
    def _initialize_quick_patterns(self) -> Dict[str, Dict]:
        """Padrões rápidos para classificação instantânea (0ms)"""
        return {
            "saudacao": {
                "patterns": [
                    r"\b(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite)\b",
                    r"^(oi|olá|ola|hey|hi)$"
                ],
                "confidence": 0.95,
                "requires_product": False
            },
            
            "como_funciona_chat": {
                "patterns": [
                    r"\b(como funciona|como usar|como posso|ajuda|help|tutorial)\b",
                    r"\b(o que você faz|que você pode|suas funções)\b"
                ],
                "confidence": 0.92,
                "requires_product": False
            },
            
            "catalogo": {
                "patterns": [
                    r"\b(que produtos|quais produtos|produtos disponíveis|catálogo|lista de produtos)\b",
                    r"\b(o que tem|o que vocês têm|que itens)\b"
                ],
                "confidence": 0.90,
                "requires_product": False
            },
            
            "promocoes_gerais": {
                "patterns": [
                    r"\b(quais as promoções|que promoções|promoções disponíveis|ofertas)\b",
                    r"\b(descontos|liquidação|promoção|oferta)\b",
                    r"^(promoções?|ofertas?)$"
                ],
                "confidence": 0.90,
                "requires_product": False
            },
            
            "melhor_preco_local": {
                "patterns": [
                    r"\b(melhor preço|mais barato|menor preço).*(perto|próximo|aqui|local)\b",
                    r"\b(perto|próximo|aqui).*(melhor preço|mais barato|menor preço)\b",
                    r"\b(onde comprar|onde encontrar).*(barato|melhor preço)\b"
                ],
                "confidence": 0.85,
                "requires_product": True
            },
            
            "promocao": {
                "patterns": [
                    r"\b\w+.*(barato|promoção|desconto|oferta|liquidação)\b",
                    r"\b(promoção|desconto|oferta).+\w+\b",
                    r"\b\w+.*(em promoção|com desconto)\b"
                ],
                "confidence": 0.80,
                "requires_product": True
            }
        }
    
    def _extract_product_from_message(self, message: str) -> Optional[str]:
        """Extrai produto da mensagem usando padrões simples"""
        # Remove palavras comuns
        stop_words = {
            'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
            'em', 'na', 'no', 'nas', 'nos', 'para', 'com', 'por', 'que', 'quero', 'preciso',
            'barato', 'baratos', 'barata', 'baratas', 'promoção', 'promoções', 'desconto',
            'descontos', 'oferta', 'ofertas', 'melhor', 'preço', 'preços', 'onde', 'comprar',
            'encontrar', 'tem', 'têm', 'há', 'existe', 'existem', 'perto', 'próximo', 'aqui',
            'local', 'região', 'área'
        }
        
        words = re.findall(r'\b\w+\b', message.lower())
        products = [word for word in words if word not in stop_words and len(word) > 2]
        
        return ' '.join(products[:2]) if products else None
    
    def _quick_classify(self, message: str) -> Optional[Tuple[str, float, Optional[str]]]:
        """Classificação rápida usando regex (0-5ms)"""
        message_lower = message.lower().strip()
        
        for intent, config in self.quick_patterns.items():
            for pattern in config["patterns"]:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    product = None
                    if config["requires_product"]:
                        product = self._extract_product_from_message(message)
                    
                    return intent, config["confidence"], product
        
        return None
    
    async def _llm_classify(self, message: str) -> Tuple[str, float, Optional[str]]:
        """Classificação usando LLM para casos complexos"""
        prompt = f"""
Classifique a intenção do usuário em uma dessas categorias:

1. saudacao - cumprimentos, saudações
2. como_funciona_chat - perguntas sobre como usar o sistema
3. catalogo - perguntas sobre produtos disponíveis
4. promocoes_gerais - perguntas sobre promoções em geral
5. melhor_preco_local - busca por melhor preço perto do usuário
6. promocao - busca por promoção de produto específico
7. outro - outras intenções

Mensagem do usuário: "{message}"

Responda APENAS com:
INTENCAO: [categoria]
PRODUTO: [produto mencionado ou "nenhum"]
CONFIANCA: [0.1 a 1.0]

Exemplo:
INTENCAO: promocao
PRODUTO: leite
CONFIANCA: 0.85
"""
        
        try:
            llm_response = await llm_manager.get_llm_response(prompt, "intent_classification")
            response_text = llm_response["response"]
            
            # Parse da resposta do LLM
            intent_match = re.search(r'INTENCAO:\s*(\w+)', response_text, re.IGNORECASE)
            product_match = re.search(r'PRODUTO:\s*([^\n]+)', response_text, re.IGNORECASE)
            confidence_match = re.search(r'CONFIANCA:\s*([\d.]+)', response_text, re.IGNORECASE)
            
            intent = intent_match.group(1).lower() if intent_match else "outro"
            product = product_match.group(1).strip() if product_match else None
            confidence = float(confidence_match.group(1)) if confidence_match else 0.7
            
            # Limpa produto se for "nenhum" ou similar
            if product and product.lower() in ["nenhum", "none", "null", "n/a"]:
                product = None
            
            return intent, confidence, product
            
        except Exception as e:
            print(f"❌ Erro na classificação LLM: {e}")
            return "outro", 0.5, None
    
    async def classify_intent(self, message: str, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Classifica intenção do usuário com sistema híbrido
        """
        start_time = time.time()
        
        # Cache check
        cache_key = f"{message.lower().strip()}_{user_id or 0}"
        if cache_key in self.intent_cache:
            cached = self.intent_cache[cache_key].copy()
            cached["response_time_ms"] = int((time.time() - start_time) * 1000)
            cached["cached"] = True
            return cached
        
        # Tenta classificação rápida primeiro
        quick_result = self._quick_classify(message)
        
        if quick_result:
            intent, confidence, product = quick_result
            method = "quick_rules"
        else:
            # Usa LLM para casos complexos
            intent, confidence, product = await self._llm_classify(message)
            method = "llm_classification"
        
        response_time = int((time.time() - start_time) * 1000)
        
        result = {
            "intent": intent,
            "confidence": confidence,
            "product": product,
            "requires_product": intent in ["promocao", "melhor_preco_local"],
            "method": method,
            "response_time_ms": response_time,
            "cached": False
        }
        
        # Cacheia resultados bons
        if confidence > 0.7:
            self.intent_cache[cache_key] = result.copy()
        
        return result
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do classificador"""
        return {
            "cache_size": len(self.intent_cache),
            "quick_patterns_count": len(self.quick_patterns),
            "supported_intents": list(self.quick_patterns.keys()) + ["outro"]
        }

# Instância global
smart_classifier = SmartIntentClassifier()
