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
    if isinstance(x, Decimal):
        return float(x)
    return float(x)


def _fmt_brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ========= BEST PROMOTIONS =========
def best_promotions(promotions_data: Optional[List[Dict[str, Any]]] = None, max_results: int = 10) -> ToolResult:
    """
    Recebe uma lista de promoções já consultadas pelo backend (com distância calculada)
    e retorna as melhores promoções, já ordenadas.
    """
    if not promotions_data:
        return ToolResult(ok=False, status=400, data="Nenhuma promoção fornecida pelo backend.")

    try:
        # Ordena por preço e distância
        promotions_data.sort(key=lambda x: (_to_float(x.get("preco_promocional", 0)), x.get("distance_km", 0)))

        # Limita ao número máximo de resultados
        top = promotions_data[:max_results]

        # Formata preço
        for r in top:
            r["preco_brl"] = _fmt_brl(_to_float(r.get("preco_promocional", 0)))

        return ToolResult(ok=True, status=200, data=top)

    except Exception as e:
        return ToolResult(ok=False, status=500, data=str(e))


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
TOOL_REGISTRY = {
    "best_promotions": best_promotions,
    "faq_answer": faq_answer,
}
