"""
🚀 SERVIDOR ULTRA-RÁPIDO - INFOHUB AI AGENT
Otimizado para respostas em < 200ms
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

# ⚡ IMPORTA O AGENTE RELÂMPAGO (SEM IA)
try:
    from lightning_agent import lightning_agent, get_lightning_stats
    USE_LIGHTNING = True
    print("⚡ MODO RELÂMPAGO ATIVADO - SEM IA, PURA VELOCIDADE!")
except ImportError:
    try:
        from ultra_fast_agent import ultra_fast_agent, get_performance_stats
        USE_LIGHTNING = False
        USE_ULTRA_FAST = True
        print("🚀 MODO ULTRA-RÁPIDO ATIVADO!")
    except ImportError:
        from agente_real import run_agent
        USE_LIGHTNING = False
        USE_ULTRA_FAST = False
        print("⚠️ Usando agente normal")

app = FastAPI(title="InfoHub AI - Lightning Fast", version="4.0.0-LIGHTNING")

# CORS otimizado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 📝 MODELOS DE REQUEST/RESPONSE OTIMIZADOS
class FastChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    user_id: Optional[int] = None
    promotions_data: Optional[List[Dict[str, Any]]] = None

class FastChatResponse(BaseModel):
    reply: str
    toolsUsed: List[str] = []
    confidence: Optional[float] = None
    response_time_ms: Optional[int] = None
    method: Optional[str] = None

# 🏠 ROOT
@app.get("/")
async def root():
    mode = "⚡ lightning" if USE_LIGHTNING else ("🚀 ultra-fast" if USE_ULTRA_FAST else "🐌 normal")
    return {
        "service": "InfoHub AI Agent",
        "version": "4.0.0-LIGHTNING", 
        "mode": mode,
        "status": "⚡ READY FOR SPEED",
        "ai_usage": "0%" if USE_LIGHTNING else "minimal"
    }

# ⚡ ENDPOINT PRINCIPAL ULTRA-RÁPIDO
@app.post("/chat", response_model=FastChatResponse)
async def lightning_fast_chat(request: FastChatRequest):
    """
    ⚡ CHAT RELÂMPAGO 
    Target: < 50ms para 95% das requisições
    """
    start_time = time.time()
    
    try:
        # Usa agente relâmpago se disponível (sem IA)
        if USE_LIGHTNING:
            result = lightning_agent(
                user_msg=request.message,
                session_id=request.session_id,
                promotions_data=request.promotions_data,
                user_id=request.user_id
            )
        elif USE_ULTRA_FAST:
            result = ultra_fast_agent(
                user_msg=request.message,
                session_id=request.session_id,
                promotions_data=request.promotions_data,
                user_id=request.user_id
            )
        else:
            # Fallback para agente normal
            result = run_agent(
                user_msg=request.message,
                session_id=request.session_id,
                promotions_data=request.promotions_data,
                user_id=request.user_id
            )
        
        # Calcula tempo de resposta
        response_time = int((time.time() - start_time) * 1000)
        
        # Prepara resposta otimizada
        return FastChatResponse(
            reply=result.get("reply", "Erro na resposta"),
            toolsUsed=result.get("toolsUsed", []),
            confidence=result.get("confidence", 0.8),
            response_time_ms=response_time,
            method=result.get("metadata", {}).get("type", "unknown")
        )
        
    except Exception as e:
        response_time = int((time.time() - start_time) * 1000)
        print(f"❌ ERRO em {response_time}ms: {str(e)}")
        
        # Resposta de erro rápida
        return FastChatResponse(
            reply="🤔 Ops! Houve um problema temporário. Pode repetir sua pergunta?",
            toolsUsed=[],
            confidence=0.1,
            response_time_ms=response_time,
            method="error_fallback"
        )

# 📊 ESTATÍSTICAS DE PERFORMANCE
@app.get("/stats")
async def performance_stats():
    """Estatísticas do sistema ultra-rápido"""
    try:
        if USE_LIGHTNING:
            return get_lightning_stats()
        elif USE_ULTRA_FAST:
            return get_performance_stats()
        else:
            return {
                "mode": "normal",
                "lightning_available": False,
                "message": "Para estatísticas avançadas, ative o modo lightning"
            }
    except Exception as e:
        return {
            "error": str(e),
            "mode": "lightning" if USE_LIGHTNING else "normal"
        }

# ❤️ HEALTH CHECK RÁPIDO
@app.get("/health")
async def health_check():
    """Health check em < 5ms"""
    return {
        "status": "✅ OK",
        "mode": "🚀 ultra-fast" if USE_ULTRA_FAST else "🐌 normal",
        "uptime": "running",
        "version": "3.0.0-TURBO"
    }

# 🔧 COMPATIBILIDADE COM ENDPOINT ANTIGO
@app.post("/ollama")
async def ollama_compatibility(request: dict):
    """Mantém compatibilidade com endpoint antigo"""
    try:
        # Converte formato antigo para novo
        fast_request = FastChatRequest(
            message=request.get("mensagem", request.get("message", "")),
            user_id=request.get("idUsuario", request.get("user_id")),
            promotions_data=request.get("promotions_data", [])
        )
        
        # Processa normalmente
        response = await lightning_fast_chat(fast_request)
        
        # Retorna no formato antigo
        return {
            "reply": response.reply,
            "toolsUsed": response.toolsUsed,
            "status": "success",
            "response_time_ms": response.response_time_ms
        }
        
    except Exception as e:
        return {
            "reply": "🤔 Erro na compatibilidade. Use /chat para melhor performance.",
            "toolsUsed": [],
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor ULTRA-RÁPIDO na porta 5001...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=5001,
        # Configurações para performance
        loop="asyncio",
        access_log=False,  # Remove logs desnecessários
        reload=False       # Desabilita reload em produção
    )