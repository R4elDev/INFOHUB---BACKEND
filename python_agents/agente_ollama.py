import json
import re
from typing import Dict, Any, Optional
from tools import TOOL_REGISTRY
from memory import Memory
import config

# Expressões regulares para parsing
TOOL_TAG = re.compile(r"<tool>(.*?)</tool>", re.S)
FINAL_TAG = re.compile(r"<final>(.*?)</final>", re.S)

def is_promo_request(msg: str) -> bool:
    return any(word in msg.lower() for word in config.PROMO_KEYWORDS)

def extract_product_name(user_msg: str) -> str:
    cleaned = re.sub(r"(quais são as melhores promoções de|promoções|preço|desconto|oferta|promo|para|de)", "", user_msg, flags=re.I)
    return cleaned.strip()

def run_agent(user_msg: str, session_id: str, promotions_data: Optional[list] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
    mem = Memory(session_id)
    messages = mem.load()

    # Adiciona mensagem de sistema
    if not any(m.get("role") == "system" for m in messages):
        messages.insert(0, {"role": "system", "content": config.SYSTEM_MESSAGE})

    # Contexto do usuário
    if user_id is not None and not any(m.get("role") == "system" and "Contexto do usuário" in m.get("content", "") for m in messages):
        messages.insert(1, {"role": "system", "content": f"Contexto do usuário: id_usuario={user_id}. Use esse id para obter informações relevantes."})

    # Mensagem do usuário
    messages.append({"role": "user", "content": user_msg})

    for _ in range(8):
        try:
            import ollama
            out = ollama.chat(model=config.MODEL, messages=messages, options={"temperature": 0.2})
            text = out["message"]["content"]
        except Exception as e:
            return {"reply": f"Erro ao processar a mensagem: {str(e)}", "toolsUsed": []}

        # Se é pedido de promoções e não há <tool>, injeta automaticamente
        if is_promo_request(user_msg) and not TOOL_TAG.search(text):
            tool_call = json.dumps({"name": "best_promotions", "args": {"promotions_data": promotions_data or []}})
            text = f"<tool>{tool_call}</tool>"

        # Resposta final
        m_final = FINAL_TAG.search(text)
        if m_final:
            final_text = m_final.group(1).strip()
            messages.append({"role": "assistant", "content": f"<final>{final_text}</final>"})
            mem.save(messages)
            return {"reply": final_text, "toolsUsed": []}

        # Chamadas para ferramentas
        m_tool = TOOL_TAG.search(text)
        if m_tool:
            try:
                call = json.loads(m_tool.group(1))
                name = call["name"]
                args = call.get("args", {})
            except Exception as e:
                messages.append({"role": "tool", "content": json.dumps({"error": f"JSON inválido: {e}"}, ensure_ascii=False)})
                continue

            tool = TOOL_REGISTRY.get(name)
            if not tool:
                messages.append({"role": "tool", "content": json.dumps({"error": f"Ferramenta desconhecida: {name}"}, ensure_ascii=False)})
                continue

            try:
                result = tool(**args)
                messages.append({"role": "tool", "content": json.dumps({"name": name, "result": result.dict()}, ensure_ascii=False)})

                if name == "best_promotions":
                    if not result.ok or not result.data:
                        final_text = "Não encontrei promoções para sua busca."
                    else:
                        final_text = "As melhores promoções são:\n"
                        for r in result.data:
                            final_text += f"- {r['produto']} no {r['estabelecimento']} — {r['cidade']}/{r['estado']} — {r['preco_brl']} — {r['distance_km']} km — até {r['data_fim']}\n"

                    messages.append({"role": "assistant", "content": f"<final>{final_text}</final>"})
                    mem.save(messages)
                    return {"reply": final_text, "toolsUsed": [name]}

            except Exception as e:
                messages.append({"role": "tool", "content": json.dumps({"name": name, "error": str(e)}, ensure_ascii=False)})
            continue

        # Se nenhuma tag foi encontrada
        messages.append({"role": "assistant", "content": text})
        mem.save(messages)
        return {"reply": text, "toolsUsed": []}

    fail = "Não consegui concluir. Verifique se há endereço cadastrado no seu perfil para localizar promoções próximas."
    messages.append({"role": "assistant", "content": f"<final>{fail}</final>"})
    mem.save(messages)
    return {"reply": fail, "toolsUsed": []}
