"""
🤖 GERENCIADOR DE LLMs GRATUITOS
Sistema inteligente que usa múltiplos LLMs gratuitos com fallback automático
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import os
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

@dataclass
class LLMProvider:
    name: str
    url: str
    headers: Dict[str, str]
    max_requests_per_minute: int
    current_requests: int = 0
    last_reset: float = 0
    is_available: bool = True
    average_response_time: float = 0

class LLMManager:
    def __init__(self):
        self.providers = self._initialize_providers()
        self.local_model = None
        self.local_tokenizer = None
        self.response_cache = {}
        
    def _initialize_providers(self) -> List[LLMProvider]:
        """Inicializa todos os provedores de LLM gratuitos"""
        return [
            # Groq - Mais rápido (100ms)
            LLMProvider(
                name="groq",
                url="https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.getenv('GROQ_API_KEY', '')}",
                    "Content-Type": "application/json"
                },
                max_requests_per_minute=30
            ),
            
            # Google Gemini - Boa qualidade
            LLMProvider(
                name="gemini",
                url="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                headers={
                    "Content-Type": "application/json"
                },
                max_requests_per_minute=15
            ),
            
            # OpenAI - Backup premium
            LLMProvider(
                name="openai",
                url="https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY', '')}",
                    "Content-Type": "application/json"
                },
                max_requests_per_minute=3  # Conservador para tier gratuito
            ),
            
            # Hugging Face - Backup local
            LLMProvider(
                name="huggingface",
                url="https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
                headers={
                    "Authorization": f"Bearer {os.getenv('HF_API_KEY', '')}",
                    "Content-Type": "application/json"
                },
                max_requests_per_minute=100
            )
        ]
    
    def _load_local_model(self):
        """Carrega modelo local como último fallback"""
        try:
            print("🔄 Carregando modelo local de fallback...")
            model_name = "microsoft/DialoGPT-small"  # Modelo leve
            self.local_tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.local_model = AutoModelForCausalLM.from_pretrained(model_name)
            self.local_tokenizer.pad_token = self.local_tokenizer.eos_token
            print("✅ Modelo local carregado com sucesso")
        except Exception as e:
            print(f"❌ Erro ao carregar modelo local: {e}")
    
    def _check_rate_limit(self, provider: LLMProvider) -> bool:
        """Verifica se o provedor está dentro do rate limit"""
        current_time = time.time()
        
        # Reset contador a cada minuto
        if current_time - provider.last_reset > 60:
            provider.current_requests = 0
            provider.last_reset = current_time
        
        return provider.current_requests < provider.max_requests_per_minute
    
    async def _call_groq(self, prompt: str, provider: LLMProvider) -> Optional[str]:
        """Chama API do Groq (mais rápido)"""
        try:
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente especializado em análise de produtos e promoções. Seja conciso e direto."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "model": "llama3-8b-8192",
                "max_tokens": 150,
                "temperature": 0.3
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    provider.url,
                    headers=provider.headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            print(f"❌ Erro Groq: {e}")
            provider.is_available = False
        
        return None
    
    async def _call_gemini(self, prompt: str, provider: LLMProvider) -> Optional[str]:
        """Chama API do Google Gemini"""
        try:
            api_key = os.getenv('GEMINI_API_KEY', '')
            if not api_key:
                return None
                
            url = f"{provider.url}?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"Você é um assistente especializado em análise de produtos e promoções. Seja conciso e direto.\n\nUsuário: {prompt}"
                    }]
                }],
                "generationConfig": {
                    "maxOutputTokens": 150,
                    "temperature": 0.3
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=8)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
        except Exception as e:
            print(f"❌ Erro Gemini: {e}")
            provider.is_available = False
        
        return None
    
    async def _call_openai(self, prompt: str, provider: LLMProvider) -> Optional[str]:
        """Chama API do OpenAI"""
        try:
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente especializado em análise de produtos e promoções. Seja conciso e direto."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 150,
                "temperature": 0.3
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    provider.url,
                    headers=provider.headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            print(f"❌ Erro OpenAI: {e}")
            provider.is_available = False
        
        return None
    
    async def _call_huggingface(self, prompt: str, provider: LLMProvider) -> Optional[str]:
        """Chama API do Hugging Face"""
        try:
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 150,
                    "temperature": 0.3,
                    "do_sample": True
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    provider.url,
                    headers=provider.headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=15)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if isinstance(data, list) and len(data) > 0:
                            return data[0].get("generated_text", "").replace(prompt, "").strip()
            
        except Exception as e:
            print(f"❌ Erro HuggingFace: {e}")
            provider.is_available = False
        
        return None
    
    def _call_local_model(self, prompt: str) -> str:
        """Usa modelo local como último fallback"""
        try:
            if not self.local_model:
                self._load_local_model()
            
            if not self.local_model:
                return "Sistema temporariamente indisponível. Tente novamente em alguns minutos."
            
            # Tokeniza entrada
            inputs = self.local_tokenizer.encode(prompt, return_tensors="pt", max_length=100, truncation=True)
            
            # Gera resposta
            with torch.no_grad():
                outputs = self.local_model.generate(
                    inputs,
                    max_length=inputs.shape[1] + 50,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.local_tokenizer.eos_token_id
                )
            
            # Decodifica resposta
            response = self.local_tokenizer.decode(outputs[0], skip_special_tokens=True)
            return response.replace(prompt, "").strip()
            
        except Exception as e:
            print(f"❌ Erro modelo local: {e}")
            return "Sistema temporariamente indisponível. Tente novamente em alguns minutos."
    
    async def get_llm_response(self, prompt: str, intent: str = "general") -> Dict[str, Any]:
        """
        Obtém resposta do melhor LLM disponível com fallback inteligente
        """
        start_time = time.time()
        
        # Verifica cache primeiro
        cache_key = f"{prompt}_{intent}"
        if cache_key in self.response_cache:
            cached_response = self.response_cache[cache_key]
            cached_response["cached"] = True
            cached_response["response_time_ms"] = int((time.time() - start_time) * 1000)
            return cached_response
        
        # Tenta cada provedor em ordem de prioridade
        for provider in self.providers:
            if not provider.is_available or not self._check_rate_limit(provider):
                continue
            
            provider.current_requests += 1
            response_text = None
            
            try:
                if provider.name == "groq":
                    response_text = await self._call_groq(prompt, provider)
                elif provider.name == "gemini":
                    response_text = await self._call_gemini(prompt, provider)
                elif provider.name == "openai":
                    response_text = await self._call_openai(prompt, provider)
                elif provider.name == "huggingface":
                    response_text = await self._call_huggingface(prompt, provider)
                
                if response_text:
                    response_time = int((time.time() - start_time) * 1000)
                    
                    result = {
                        "response": response_text,
                        "provider": provider.name,
                        "response_time_ms": response_time,
                        "cached": False,
                        "confidence": 0.9
                    }
                    
                    # Cacheia respostas rápidas e boas
                    if response_time < 2000 and len(response_text) > 10:
                        self.response_cache[cache_key] = result.copy()
                    
                    return result
                    
            except Exception as e:
                print(f"❌ Erro no provedor {provider.name}: {e}")
                provider.is_available = False
                continue
        
        # Fallback para modelo local
        print("🔄 Usando modelo local como fallback...")
        response_text = self._call_local_model(prompt)
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "response": response_text,
            "provider": "local_fallback",
            "response_time_ms": response_time,
            "cached": False,
            "confidence": 0.6
        }
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Retorna status de todos os provedores"""
        return {
            "providers": [
                {
                    "name": p.name,
                    "available": p.is_available,
                    "requests_used": p.current_requests,
                    "max_requests": p.max_requests_per_minute,
                    "avg_response_time": p.average_response_time
                }
                for p in self.providers
            ],
            "cache_size": len(self.response_cache),
            "local_model_loaded": self.local_model is not None
        }

# Instância global
llm_manager = LLMManager()
