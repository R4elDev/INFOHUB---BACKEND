"""
🧪 SCRIPT DE TESTE COMPLETO
Testa todos os componentes do sistema melhorado
"""

import asyncio
import time
import os
import sys
from typing import Dict, Any

def test_imports():
    """Testa se todas as importações funcionam"""
    print("🔍 Testando importações...")
    
    try:
        import aiohttp
        print("✅ aiohttp importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar aiohttp: {e}")
        return False
    
    try:
        import transformers
        print("✅ transformers importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar transformers: {e}")
        return False
    
    try:
        import torch
        print("✅ torch importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar torch: {e}")
        return False
    
    try:
        from llm_manager import llm_manager
        print("✅ llm_manager importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar llm_manager: {e}")
        return False
    
    try:
        from smart_intent_classifier import smart_classifier
        print("✅ smart_intent_classifier importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar smart_intent_classifier: {e}")
        return False
    
    try:
        from enhanced_agent import enhanced_agent
        print("✅ enhanced_agent importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar enhanced_agent: {e}")
        return False
    
    return True

def test_env_config():
    """Testa configuração do ambiente"""
    print("\n🔧 Testando configuração...")
    
    # Carrega variáveis de ambiente
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️ python-dotenv não encontrado, tentando sem ele...")
    
    apis_configured = []
    
    if os.getenv('GROQ_API_KEY') and os.getenv('GROQ_API_KEY') != 'your_groq_api_key_here':
        apis_configured.append('Groq')
    
    if os.getenv('GEMINI_API_KEY') and os.getenv('GEMINI_API_KEY') != 'your_gemini_api_key_here':
        apis_configured.append('Gemini')
    
    if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your_openai_api_key_here':
        apis_configured.append('OpenAI')
    
    if os.getenv('HF_API_KEY') and os.getenv('HF_API_KEY') != 'your_huggingface_api_key_here':
        apis_configured.append('HuggingFace')
    
    if apis_configured:
        print(f"✅ APIs configuradas: {', '.join(apis_configured)}")
        return True
    else:
        print("⚠️ Nenhuma API configurada - sistema funcionará apenas com modelo local")
        return False

async def test_intent_classifier():
    """Testa o classificador de intenções"""
    print("\n🧠 Testando classificador de intenções...")
    
    try:
        from smart_intent_classifier import smart_classifier
        
        test_messages = [
            "olá",
            "quais as promoções?",
            "leite barato",
            "como funciona?",
            "que produtos têm?"
        ]
        
        for msg in test_messages:
            start_time = time.time()
            result = await smart_classifier.classify_intent(msg)
            response_time = int((time.time() - start_time) * 1000)
            
            print(f"  📝 '{msg}' → {result['intent']} ({result['confidence']:.2f}) [{response_time}ms]")
        
        print("✅ Classificador funcionando corretamente")
        return True
        
    except Exception as e:
        print(f"❌ Erro no classificador: {e}")
        return False

async def test_llm_manager():
    """Testa o gerenciador de LLMs"""
    print("\n🤖 Testando gerenciador de LLMs...")
    
    try:
        from llm_manager import llm_manager
        
        # Testa resposta simples
        result = await llm_manager.get_llm_response("Olá, como você pode me ajudar?", "test")
        
        print(f"  📝 Resposta: {result['response'][:100]}...")
        print(f"  🔧 Provedor: {result['provider']}")
        print(f"  ⏱️ Tempo: {result['response_time_ms']}ms")
        print(f"  🎯 Confiança: {result['confidence']}")
        
        print("✅ LLM Manager funcionando corretamente")
        return True
        
    except Exception as e:
        print(f"❌ Erro no LLM Manager: {e}")
        return False

async def test_enhanced_agent():
    """Testa o agente melhorado"""
    print("\n🚀 Testando agente melhorado...")
    
    try:
        from enhanced_agent import enhanced_agent
        
        test_messages = [
            "oi",
            "como funciona?",
            "quais as promoções?",
            "leite barato"
        ]
        
        for msg in test_messages:
            start_time = time.time()
            result = await enhanced_agent.process_message(msg, "test_session", user_id=1)
            response_time = int((time.time() - start_time) * 1000)
            
            print(f"  📝 '{msg}'")
            print(f"     → {result['reply'][:100]}...")
            print(f"     → Tempo: {response_time}ms | Método: {result['metadata'].get('method', 'N/A')}")
        
        print("✅ Agente melhorado funcionando corretamente")
        return True
        
    except Exception as e:
        print(f"❌ Erro no agente melhorado: {e}")
        return False

def test_server_import():
    """Testa se o servidor pode ser importado"""
    print("\n🌐 Testando servidor...")
    
    try:
        import server_enhanced
        print("✅ Servidor pode ser importado corretamente")
        return True
    except Exception as e:
        print(f"❌ Erro ao importar servidor: {e}")
        return False

async def run_all_tests():
    """Executa todos os testes"""
    print("🧪 INICIANDO TESTES DO SISTEMA MELHORADO")
    print("=" * 50)
    
    tests = [
        ("Importações", test_imports),
        ("Configuração", test_env_config),
        ("Classificador", test_intent_classifier),
        ("LLM Manager", test_llm_manager),
        ("Agente Melhorado", test_enhanced_agent),
        ("Servidor", test_server_import)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ Erro crítico no teste {test_name}: {e}")
            results[test_name] = False
    
    # Resumo final
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name:20} {status}")
    
    print(f"\n🎯 RESULTADO FINAL: {passed}/{total} testes passaram")
    
    if passed == total:
        print("🎉 TODOS OS TESTES PASSARAM! Sistema pronto para uso.")
    elif passed >= total * 0.7:
        print("⚠️ Maioria dos testes passou. Sistema funcional com limitações.")
    else:
        print("❌ Muitos testes falharam. Verifique configuração e dependências.")
    
    return results

if __name__ == "__main__":
    # Executa os testes
    asyncio.run(run_all_tests())
