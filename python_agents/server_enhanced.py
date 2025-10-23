"""
🚀 SERVIDOR MELHORADO COM LLMs GRATUITOS
FastAPI server com sistema híbrido inteligente
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import time
import os
from enhanced_agent import enhanced_agent

# Configuração do FastAPI
app = FastAPI(
    title="InfoHub Enhanced AI Agent",
    description="Sistema híbrido com múltiplos LLMs gratuitos",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    promotions_data: Optional[List[Dict]] = None

class ChatResponse(BaseModel):
    reply: str
    confidence: float
    toolsUsed: List[str] = []
    metadata: Dict[str, Any] = {}

class HealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    stats: Dict[str, Any]

# Variáveis globais
start_time = time.time()

@app.get("/", response_model=Dict[str, str])
async def root():
    """Endpoint raiz com informações básicas"""
    return {
        "service": "InfoHub Enhanced AI Agent",
        "version": "2.0.0",
        "status": "running",
        "features": "Multi-LLM support with intelligent fallback"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Endpoint de saúde com estatísticas detalhadas"""
    uptime = time.time() - start_time
    stats = enhanced_agent.get_stats()
    
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        uptime_seconds=uptime,
        stats=stats
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint principal de chat com sistema híbrido
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Mensagem não pode estar vazia")
        
        # Processa mensagem com o agente melhorado
        result = await enhanced_agent.process_message(
            user_msg=request.message.strip(),
            session_id=request.session_id or f"user-{request.user_id or 0}",
            promotions_data=request.promotions_data,
            user_id=request.user_id
        )
        
        return ChatResponse(
            reply=result["reply"],
            confidence=result.get("confidence", 0.8),
            toolsUsed=result.get("toolsUsed", []),
            metadata=result.get("metadata", {})
        )
        
    except Exception as e:
        print(f"❌ Erro no endpoint de chat: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno do servidor: {str(e)}"
        )

@app.get("/stats")
async def get_detailed_stats():
    """Endpoint com estatísticas detalhadas do sistema"""
    return {
        "agent_stats": enhanced_agent.get_stats(),
        "uptime_seconds": time.time() - start_time,
        "version": "2.0.0",
        "features": {
            "multi_llm_support": True,
            "intelligent_fallback": True,
            "response_caching": True,
            "intent_classification": True,
            "database_integration": True
        }
    }

@app.post("/test-llm")
async def test_llm_providers():
    """Endpoint para testar todos os provedores de LLM"""
    from llm_manager import llm_manager
    
    test_prompt = "Olá, como você pode me ajudar?"
    
    results = {}
    for provider in llm_manager.providers:
        try:
            start_time_test = time.time()
            
            if provider.name == "groq":
                response = await llm_manager._call_groq(test_prompt, provider)
            elif provider.name == "gemini":
                response = await llm_manager._call_gemini(test_prompt, provider)
            elif provider.name == "openai":
                response = await llm_manager._call_openai(test_prompt, provider)
            elif provider.name == "huggingface":
                response = await llm_manager._call_huggingface(test_prompt, provider)
            else:
                response = None
            
            response_time = int((time.time() - start_time_test) * 1000)
            
            results[provider.name] = {
                "available": response is not None,
                "response_time_ms": response_time,
                "response_preview": response[:100] if response else None,
                "error": None if response else "No response received"
            }
            
        except Exception as e:
            results[provider.name] = {
                "available": False,
                "response_time_ms": 0,
                "response_preview": None,
                "error": str(e)
            }
    
    return {
        "test_prompt": test_prompt,
        "results": results,
        "local_model_available": llm_manager.local_model is not None
    }

@app.get("/clear-cache")
async def clear_all_caches():
    """Limpa todos os caches do sistema"""
    try:
        # Limpa cache do agente
        cache_size_agent = len(enhanced_agent.response_cache)
        enhanced_agent.response_cache.clear()
        
        # Limpa cache do classificador
        from smart_intent_classifier import smart_classifier
        cache_size_classifier = len(smart_classifier.intent_cache)
        smart_classifier.intent_cache.clear()
        
        # Limpa cache do LLM manager
        from llm_manager import llm_manager
        cache_size_llm = len(llm_manager.response_cache)
        llm_manager.response_cache.clear()
        
        return {
            "message": "Caches limpos com sucesso",
            "cleared": {
                "agent_cache": cache_size_agent,
                "classifier_cache": cache_size_classifier,
                "llm_cache": cache_size_llm,
                "total": cache_size_agent + cache_size_classifier + cache_size_llm
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar caches: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Iniciando InfoHub Enhanced AI Agent...")
    print("📊 Recursos disponíveis:")
    print("   • Múltiplos LLMs gratuitos (Groq, Gemini, OpenAI, HuggingFace)")
    print("   • Fallback inteligente para modelo local")
    print("   • Cache multi-camadas")
    print("   • Classificação híbrida de intenções")
    print("   • Integração com banco de dados")
    print("\n🌐 Endpoints:")
    print("   • POST /chat - Chat principal")
    print("   • GET /health - Status do sistema")
    print("   • GET /stats - Estatísticas detalhadas")
    print("   • POST /test-llm - Teste dos provedores")
    print("   • GET /clear-cache - Limpar caches")
    
    uvicorn.run(
        "server_enhanced:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        log_level="info"
    )
