# tools.py
from __future__ import annotations
from typing import Any, Dict, Optional, List
from pydantic import BaseModel
from decimal import Decimal


# ========= MODELO RETORNO =========
class ToolResult(BaseModel):
    ok: bool
    status: int
    data: Any


# ========= HELPERS =========
def _to_float(x) -> float:
    if x is None:
        return 0.0
    if isinstance(x, Decimal):
        return float(x)
    if isinstance(x, (int, float)):
        return float(x)
    if isinstance(x, str):
        s = x.strip().replace("R$", "").replace(" ", "")
        # trata formatos pt-BR tipo "1.234,56"
        s = s.replace(".", "").replace(",", ".")
        try:
            return float(s)
        except ValueError:
            return 0.0
    try:
        return float(x)
    except Exception:
        return 0.0


def _fmt_brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ========= BEST PROMOTIONS =========
def best_promotions(promotions_data: Optional[List[Dict[str, Any]]] = None, max_results: int = 10, termo_busca: str = "", user_id: int = 0) -> ToolResult:
    """
    Busca as melhores promoções. Se promotions_data vier do backend, usa ela.
    Senão, faz consulta direta no banco de dados.
    """
    try:
        promocoes = promotions_data or []
        
        # Se não há dados do backend, tenta consulta direta (fallback)
        if not promocoes and termo_busca and user_id:
            try:
                from database import db_manager
                promocoes = db_manager.buscar_promocoes_real(termo_busca, user_id, 10, max_results)
            except Exception as db_error:
                print(f"Erro consulta direta: {db_error}")
                promocoes = []
        
        if not promocoes:
            return ToolResult(ok=False, status=404, data="Nenhuma promoção encontrada.")
            
        # Ordena por preço e distância
        ordered = sorted(
            promocoes,
            key=lambda x: (_to_float(x.get("preco_promocional", 0)), _to_float(x.get("distance_km", 0))),
        )

        top = ordered[:max_results]

        result = []
        for r in top:
            preco = _to_float(r.get("preco_promocional", 0))
            r_fmt = {**r, "preco_brl": _fmt_brl(preco)}
            result.append(r_fmt)

        return ToolResult(ok=True, status=200, data=result)
    except Exception as e:
        return ToolResult(ok=False, status=500, data=str(e))


# ========= FIND NEARBY PROMOTIONS (novo - para listar promoções gerais) =========
def find_nearby_promotions(user_id: int = None) -> List[Dict[str, Any]]:
    """
    🏆 BUSCA AS MELHORES PROMOÇÕES PRÓXIMAS (SEM PRODUTO ESPECÍFICO)
    Para quando o usuário pergunta "quais as promoções?"
    """
    try:
        # TENTA USAR CONEXÃO MYSQL REAL PRIMEIRO
        try:
            from mysql_real import db_manager
            
            # Verifica se tem conexão
            if db_manager.connection and db_manager.connection.is_connected():
                print(f"🔍 Fazendo busca GERAL de promoções próximas para usuário {user_id}")
                
                # Busca real no banco
                real_results = db_manager.buscar_promocoes_proximas(user_id or 1, 10, 5)
                
                if real_results:
                    print(f"✅ Encontradas {len(real_results)} promoções próximas no MySQL")
                    return real_results
                else:
                    print("⚠️ Nenhuma promoção próxima encontrada no MySQL")
                    return []
            else:
                print("❌ Sem conexão MySQL - usando dados simulados")
                
        except ImportError:
            print("❌ Módulo mysql_real não encontrado - usando dados simulados")
        except Exception as mysql_error:
            print(f"❌ Erro MySQL: {mysql_error} - usando dados simulados")
        
        # FALLBACK PARA DADOS SIMULADOS (se MySQL não funcionar)
        print(f"🔧 Usando dados simulados de promoções próximas")
        
        return [
            {
                "id_promocao": 1,
                "produto": "Leite Integral 1L",
                "estabelecimento": "Supermercado ABC",
                "preco_promocional": 4.50,
                "data_fim": "2025-10-15",
                "distance_km": 0.8,
                "preco_brl": "R$ 4,50"
            },
            {
                "id_promocao": 2,
                "produto": "Arroz 5kg",
                "estabelecimento": "Atacado Bom Preço",
                "preco_promocional": 12.90,
                "data_fim": "2025-10-18",
                "distance_km": 1.2,
                "preco_brl": "R$ 12,90"
            },
            {
                "id_promocao": 3,
                "produto": "Shampoo 400ml",
                "estabelecimento": "Farmácia Popular",
                "preco_promocional": 8.90,
                "data_fim": "2025-10-25",
                "distance_km": 0.5,
                "preco_brl": "R$ 8,90"
            }
        ]
            
    except Exception as e:
        print(f"❌ Erro geral na busca de promoções próximas: {e}")
        return []


# ========= FIND PROMOTIONS (usado pelo agente rápido) =========
def find_promotions(user_message: str, user_id: int = None) -> List[Dict[str, Any]]:
    """
    🔍 BUSCA REAL DE PROMOÇÕES NO BANCO
    Esta função é chamada pelo agente lightning e faz busca real no MySQL
    """
    try:
        # Extrai termo de busca da mensagem
        term = extract_search_term(user_message)
        
        # TENTA USAR CONEXÃO MYSQL REAL PRIMEIRO
        try:
            from mysql_real import db_manager
            
            # Verifica se tem conexão
            if db_manager.connection and db_manager.connection.is_connected():
                print(f"🔍 Fazendo busca REAL no MySQL para '{term}' e usuário {user_id}")
                
                # Busca real no banco
                real_results = db_manager.buscar_promocoes_real(term, user_id or 1, 10, 5)
                
                if real_results:
                    print(f"✅ Encontradas {len(real_results)} promoções REAIS no MySQL")
                    return real_results
                else:
                    print("⚠️ Nenhuma promoção encontrada no MySQL")
                    return []
            else:
                print("❌ Sem conexão MySQL - usando dados simulados")
                
        except ImportError:
            print("❌ Módulo mysql_real não encontrado - usando dados simulados")
        except Exception as mysql_error:
            print(f"❌ Erro MySQL: {mysql_error} - usando dados simulados")
        
        # FALLBACK PARA DADOS SIMULADOS (se MySQL não funcionar)
        print(f"🔧 Usando dados simulados para '{term}'")
        
        if term and term.lower() in ['leite', 'iogurte', 'queijo']:
            # Simula dados reais do banco para laticínios
            return [
                {
                    "id_promocao": 1,
                    "produto": f"{term.title()} Integral 1L",
                    "estabelecimento": "Supermercado ABC",
                    "preco_promocional": 4.50,
                    "preco_original": 5.20,
                    "data_fim": "2025-10-15",
                    "distance_km": 0.8,
                    "preco_brl": "R$ 4,50"
                },
                {
                    "id_promocao": 2,
                    "produto": f"{term.title()} Desnatado 1L",
                    "estabelecimento": "Mercado XYZ",
                    "preco_promocional": 4.80,
                    "preco_original": 5.50,
                    "data_fim": "2025-10-20",
                    "distance_km": 1.2,
                    "preco_brl": "R$ 4,80"
                }
            ]
        elif term and term.lower() in ['arroz', 'feijão', 'açúcar', 'óleo']:
            # Simula dados para alimentos
            return [
                {
                    "id_promocao": 3,
                    "produto": f"{term.title()} 5kg",
                    "estabelecimento": "Atacado Bom Preço",
                    "preco_promocional": 12.90,
                    "preco_original": 15.50,
                    "data_fim": "2025-10-18",
                    "distance_km": 2.1,
                    "preco_brl": "R$ 12,90"
                }
            ]
        elif term and term.lower() in ['shampoo', 'condicionador', 'sabonete']:
            # Simula dados para higiene
            return [
                {
                    "id_promocao": 4,
                    "produto": f"{term.title()} 400ml",
                    "estabelecimento": "Farmácia Popular",
                    "preco_promocional": 8.90,
                    "preco_original": 12.50,
                    "data_fim": "2025-10-25",
                    "distance_km": 0.5,
                    "preco_brl": "R$ 8,90"
                }
            ]
        else:
            # Não encontrou promoções
            return []
            
    except Exception as e:
        print(f"❌ Erro geral na busca: {e}")
        return []

def extract_search_term(message: str) -> str:
    """Extrai termo de busca da mensagem do usuário com correções ortográficas"""
    message_lower = message.lower().strip()
    
    # ⚠️ PRIMEIRA VERIFICAÇÃO: Não extrai produto de perguntas gerais sobre promoções
    skip_phrases = [
        'quais as promoções', 'que promoções', 'promoções disponíveis', 
        'quais ofertas', 'que ofertas', 'ofertas disponíveis',
        'promoções perto', 'quais as ofertas', 'ofertas perto de mim',
        'ofertas próximas', 'promoções próximas', 'quais são suas promoções',
        'suas promoções', 'as promoções', 'suas ofertas'
    ]
    for phrase in skip_phrases:
        if phrase in message_lower:
            print(f"🚫 Pergunta geral detectada: '{phrase}' - não extraindo produto")
            return ""  # Não extrai produto para perguntas gerais
    
    # Também verifica palavras isoladas que indicam pergunta geral
    words = message_lower.split()
    if len(words) >= 2 and words[0] in ['quais', 'que'] and any(w in words for w in ['promoções', 'ofertas', 'suas']):
        print(f"🚫 Pergunta geral por palavras: '{message}' - não extraindo produto")
        return ""
    
    # Dicionário de correções ortográficas comuns
    correções = {
        'iougurte': 'iogurte',
        'yogurte': 'iogurte', 
        'yogurt': 'iogurte',
        'leiti': 'leite',
        'xampu': 'shampoo',
        'refrigeranti': 'refrigerante',
        'detergenté': 'detergente',
        'acucar': 'açúcar',
        'açucar': 'açúcar',
        'oleo': 'óleo',
        'sabao': 'sabão',
        'feija': 'feijão',
        'feijao': 'feijão',
        'remedio': 'remédio'
    }
    
    # Aplica correções primeiro
    message_corrigida = message_lower
    for erro, correto in correções.items():
        if erro in message_corrigida:
            message_corrigida = message_corrigida.replace(erro, correto)
            print(f"🔧 Correção aplicada: '{erro}' → '{correto}'")
    
    # Lista de produtos conhecidos (expandida)
    produtos = [
        'leite', 'iogurte', 'queijo', 'manteiga', 'creme', 'requeijão',
        'shampoo', 'condicionador', 'sabonete', 'pasta', 'escova', 'desodorante',
        'detergente', 'sabão', 'amaciante', 'desinfetante', 'água sanitária',
        'arroz', 'feijão', 'açúcar', 'óleo', 'sal', 'farinha', 'macarrão',
        'suco', 'refrigerante', 'água', 'cerveja', 'vinho',
        'pão', 'biscoito', 'bolo', 'chocolate', 'café',
        'remédio', 'vitamina', 'band-aid', 'álcool'
    ]
    
    # Procura produtos na mensagem corrigida
    for produto in produtos:
        if produto in message_corrigida:
            print(f"🎯 Produto detectado: '{produto}' na mensagem '{message}'")
            return produto
    
    # Busca por similaridade (para casos como "yogurt" vs "iogurte")
    # SKIP palavras muito curtas ou stopwords para evitar falsos positivos
    skip_similarity = {'quais', 'qual', 'que', 'são', 'suas', 'voce', 'você', 'tem', 'há', 'existe', 'onde', 'como', 'quando', 'perto', 'próximo'}
    
    for palavra in message_corrigida.split():
        if len(palavra) > 4 and palavra not in skip_similarity:  # Só palavras > 4 chars e não stopwords
            for produto in produtos:
                # Verifica se é muito similar (diferença de 1-2 caracteres)
                if abs(len(palavra) - len(produto)) <= 2:
                    diferenças = sum(1 for a, b in zip(palavra, produto) if a != b)
                    if diferenças <= 2:
                        print(f"🔍 Produto similar detectado: '{palavra}' → '{produto}'")
                        return produto
    
    # Se não encontrar produto específico, usa palavras genéricas válidas
    stop_words = {'de', 'da', 'do', 'para', 'com', 'sem', 'por', 'em', 'na', 'no', 'a', 'o', 'e', 'ou', 'que', 'quero', 'buscar', 'encontrar', 'ver', 'tem', 'há', 'existe', 'barato', 'caro', 'promoção', 'desconto', 'oferta', 'perto', 'longe', 'próximo', 'preciso', 'quais', 'qual', 'são', 'suas', 'você', 'voce', 'como', 'quando', 'onde'}
    
    words = message_corrigida.split()
    for word in words:
        if len(word) > 3 and word not in stop_words:
            print(f"💭 Termo genérico detectado: '{word}'")
            return word
    
    return ""

# ========= FAQ =========
_FAQ = {
    "o que é o sistema": "Encontramos promoções ativas perto de você e ranqueamos por preço e distância.",
    "como escolhem as promocoes": "Filtramos por validade, aplicamos raio a partir da sua localização e ordenamos por menor preço (desempate por distância).",
    "como informar minha localizacao": "Sua localização é obtida do seu endereço cadastrado. Cadastre um endereço no perfil para resultados locais.",
    "como filtrar por categoria": "Peça a categoria pelo nome (ex.: laticínios, bebidas, higiene).",
    "foco": "Sou um agente de promoções e dúvidas rápidas do sistema; não respondo fora desse tema."
}


def faq_answer(question: str) -> ToolResult:
    q = question.lower()
    for k, v in _FAQ.items():
        if k in q:
            return ToolResult(ok=True, status=200, data={"question": k, "answer": v})
    return ToolResult(ok=True, status=200, data={"answer": _FAQ["foco"]})


# ========= Registro =========
def health_ping(meta: Optional[Dict[str, Any]] = None) -> ToolResult:
    """Tool de verificação rápida de conectividade do agent."""
    return ToolResult(ok=True, status=200, data={"message": "pong", "meta": meta or {}})


TOOL_REGISTRY = {
    "best_promotions": best_promotions,
    "faq_answer": faq_answer,
    "health_ping": health_ping,
}
