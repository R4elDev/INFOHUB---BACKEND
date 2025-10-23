"""
🚀 AGENTE MELHORADO COM LLMs GRATUITOS
Sistema híbrido que combina velocidade + inteligência artificial
"""

import time
import asyncio
from typing import Dict, Any, Optional
from smart_intent_classifier import smart_classifier
from llm_manager import llm_manager
import tools
import speed_config

class EnhancedAgent:
    def __init__(self):
        self.response_cache = {}
        self.stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "quick_responses": 0,
            "llm_responses": 0,
            "avg_response_time": 0
        }
    
    async def process_message(self, user_msg: str, session_id: str, 
                            promotions_data: Optional[list] = None, 
                            user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Processa mensagem com sistema híbrido inteligente
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        
        try:
            # 1. Cache check ultra-rápido
            cache_key = f"{user_msg.lower().strip()}_{user_id or 0}"
            if cache_key in self.response_cache:
                self.stats["cache_hits"] += 1
                response = self.response_cache[cache_key].copy()
                response_time = int((time.time() - start_time) * 1000)
                response["metadata"]["response_time_ms"] = response_time
                response["metadata"]["cached"] = True
                return response
            
            # 2. Classificação de intenção inteligente
            intent_result = await smart_classifier.classify_intent(user_msg, user_id)
            intent = intent_result["intent"]
            confidence = intent_result["confidence"]
            product = intent_result["product"]
            
            # 3. Processamento baseado na intenção
            if intent in ["saudacao", "como_funciona_chat", "catalogo", "promocoes_gerais"]:
                # Respostas rápidas pré-definidas
                response = self._get_quick_response(intent, user_msg)
                self.stats["quick_responses"] += 1
                
            elif intent in ["promocao", "melhor_preco_local"] and product:
                # Busca no banco + LLM para resposta inteligente
                response = await self._get_intelligent_response(intent, product, user_msg, user_id)
                self.stats["llm_responses"] += 1
                
            else:
                # Resposta genérica com LLM
                response = await self._get_llm_response(user_msg, intent)
                self.stats["llm_responses"] += 1
            
            # 4. Adiciona metadados
            response_time = int((time.time() - start_time) * 1000)
            response["metadata"] = {
                "response_time_ms": response_time,
                "cached": False,
                "agent": "enhanced",
                "intent": intent,
                "confidence": confidence,
                "method": intent_result["method"]
            }
            
            # 5. Cache para respostas boas e rápidas
            if response_time < 2000 and confidence > 0.7:
                self.response_cache[cache_key] = response.copy()
            
            # 6. Atualiza estatísticas
            self.stats["avg_response_time"] = (self.stats["avg_response_time"] + response_time) / 2
            
            return response
            
        except Exception as e:
            print(f"❌ Erro no agente melhorado: {e}")
            return self._get_error_response(str(e))
    
    def _get_quick_response(self, intent: str, message: str) -> Dict[str, Any]:
        """Respostas rápidas pré-definidas"""
        responses = {
            "saudacao": {
                "reply": "👋 Olá! Sou seu assistente de compras inteligente. Posso te ajudar a encontrar produtos, promoções e os melhores preços. Como posso ajudar?",
                "confidence": 0.95
            },
            
            "como_funciona_chat": {
                "reply": """🤖 **Como usar o InfoHub:**

📱 **Exemplos do que posso fazer:**
• "leite barato" → Encontro promoções de leite
• "farmácia perto" → Melhores preços próximos
• "que produtos têm" → Lista do catálogo
• "quais as promoções" → Top 5 ofertas

💡 **Dicas:**
• Seja específico: "açúcar cristal" é melhor que "açúcar"
• Posso buscar por categoria: "produtos de limpeza"
• Pergunto sobre localização quando necessário

🚀 **Vamos começar?** Digite o que procura!""",
                "confidence": 0.92
            },
            
            "catalogo": {
                "reply": self._get_catalog_response(),
                "confidence": 0.90
            },
            
            "promocoes_gerais": {
                "reply": self._get_general_promotions(),
                "confidence": 0.90
            }
        }
        
        return responses.get(intent, {
            "reply": "🤔 Não entendi bem. Tente perguntar sobre produtos, promoções ou preços!",
            "confidence": 0.5
        })
    
    def _get_catalog_response(self) -> str:
        """Resposta do catálogo usando ferramentas existentes"""
        try:
            # Usa as ferramentas existentes para buscar produtos
            catalog_data = tools.get_available_products()
            if catalog_data and len(catalog_data) > 0:
                # Agrupa por categoria
                categories = {}
                for product in catalog_data[:20]:  # Limita para não sobrecarregar
                    category = product.get('categoria', 'Outros')
                    if category not in categories:
                        categories[category] = []
                    categories[category].append(product['nome'])
                
                response = "🛒 **Produtos disponíveis:**\n\n"
                for category, products in categories.items():
                    response += f"**{category}:**\n"
                    for product in products[:5]:  # Max 5 por categoria
                        response += f"• {product}\n"
                    response += "\n"
                
                response += "💡 **Dica:** Digite o nome do produto para ver promoções!"
                return response
            else:
                return "🛒 Catálogo temporariamente indisponível. Tente perguntar por produtos específicos como 'leite', 'pão', 'remédio', etc."
                
        except Exception as e:
            print(f"❌ Erro ao buscar catálogo: {e}")
            return "🛒 Catálogo temporariamente indisponível. Tente perguntar por produtos específicos!"
    
    def _get_general_promotions(self) -> str:
        """Resposta de promoções gerais"""
        try:
            promotions = tools.get_top_promotions(limit=5)
            if promotions and len(promotions) > 0:
                response = "🔥 **Top 5 Promoções:**\n\n"
                for i, promo in enumerate(promotions, 1):
                    response += f"**{i}. {promo['produto']}**\n"
                    response += f"💰 R$ {promo['preco']:.2f} "
                    if promo.get('desconto'):
                        response += f"({promo['desconto']}% OFF)"
                    response += f"\n📍 {promo['loja']}\n\n"
                
                response += "💡 **Quer mais detalhes?** Digite o nome do produto!"
                return response
            else:
                return "🔥 Não encontrei promoções no momento. Tente buscar por produtos específicos como 'leite barato' ou 'remédio desconto'!"
                
        except Exception as e:
            print(f"❌ Erro ao buscar promoções: {e}")
            return "🔥 Promoções temporariamente indisponíveis. Tente buscar produtos específicos!"
    
    async def _get_intelligent_response(self, intent: str, product: str, 
                                      message: str, user_id: Optional[int]) -> Dict[str, Any]:
        """Resposta inteligente combinando dados + LLM"""
        try:
            # Busca dados no banco
            if intent == "promocao":
                data = tools.search_product_promotions(product)
            elif intent == "melhor_preco_local":
                data = tools.search_best_local_prices(product, user_id)
            else:
                data = []
            
            if not data or len(data) == 0:
                return {
                    "reply": f"🔍 Não encontrei promoções para '{product}' no momento. Tente:\n• Verificar a grafia\n• Usar termos mais gerais\n• Perguntar sobre outros produtos",
                    "confidence": 0.6
                }
            
            # Formata dados para o LLM
            data_summary = self._format_data_for_llm(data, intent, product)
            
            # Prompt para o LLM
            prompt = f"""
Você é um assistente de compras especializado. O usuário perguntou: "{message}"

Dados encontrados:
{data_summary}

Crie uma resposta útil e bem formatada que:
1. Seja amigável e direta
2. Destaque as melhores opções (máximo 3-5)
3. Inclua preços, lojas e descontos quando disponível
4. Use emojis para tornar mais visual
5. Termine com uma dica útil

Mantenha a resposta concisa (máximo 200 palavras).
"""
            
            llm_response = await llm_manager.get_llm_response(prompt, intent)
            
            return {
                "reply": llm_response["response"],
                "confidence": llm_response["confidence"],
                "toolsUsed": ["database_search", "llm_formatting"],
                "data_found": len(data)
            }
            
        except Exception as e:
            print(f"❌ Erro na resposta inteligente: {e}")
            return {
                "reply": f"🔍 Encontrei informações sobre '{product}', mas houve um erro ao processar. Tente novamente em alguns segundos.",
                "confidence": 0.4
            }
    
    def _format_data_for_llm(self, data: list, intent: str, product: str) -> str:
        """Formata dados do banco para o LLM"""
        if not data:
            return "Nenhum dado encontrado."
        
        formatted = f"Produto: {product}\n"
        formatted += f"Resultados encontrados: {len(data)}\n\n"
        
        for i, item in enumerate(data[:5], 1):  # Máximo 5 itens
            formatted += f"{i}. {item.get('nome', product)}\n"
            formatted += f"   Preço: R$ {item.get('preco', 0):.2f}\n"
            formatted += f"   Loja: {item.get('loja', 'N/A')}\n"
            if item.get('desconto'):
                formatted += f"   Desconto: {item['desconto']}%\n"
            if item.get('endereco'):
                formatted += f"   Local: {item['endereco']}\n"
            formatted += "\n"
        
        return formatted
    
    async def _get_llm_response(self, message: str, intent: str) -> Dict[str, Any]:
        """Resposta genérica usando LLM"""
        prompt = f"""
Você é um assistente de compras inteligente. O usuário disse: "{message}"

Intenção detectada: {intent}

Responda de forma útil e amigável, sugerindo como você pode ajudar com:
- Busca de produtos e promoções
- Comparação de preços
- Localização de lojas
- Dicas de compras

Seja conciso (máximo 100 palavras) e termine com uma pergunta ou sugestão.
"""
        
        try:
            llm_response = await llm_manager.get_llm_response(prompt, "general")
            return {
                "reply": llm_response["response"],
                "confidence": llm_response["confidence"],
                "toolsUsed": ["llm_general"]
            }
        except Exception as e:
            print(f"❌ Erro na resposta LLM: {e}")
            return {
                "reply": "🤔 Não entendi bem sua pergunta. Tente perguntar sobre produtos específicos, promoções ou preços!",
                "confidence": 0.3
            }
    
    def _get_error_response(self, error: str) -> Dict[str, Any]:
        """Resposta de erro padronizada"""
        return {
            "reply": "🤔 Sistema temporariamente indisponível. Tente: 'leite barato', 'farmácia perto' ou 'que produtos têm'",
            "confidence": 0.1,
            "metadata": {
                "response_time_ms": 50,
                "cached": False,
                "agent": "enhanced",
                "error": error,
                "method": "error_fallback"
            }
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do agente"""
        return {
            **self.stats,
            "cache_size": len(self.response_cache),
            "classifier_stats": smart_classifier.get_stats(),
            "llm_status": llm_manager.get_provider_status()
        }

# Instância global
enhanced_agent = EnhancedAgent()
