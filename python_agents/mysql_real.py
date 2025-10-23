"""
🔗 CONEXÃO REAL COM MYSQL - INFOHUB
Integra o agente Python com o banco de dados real
"""

import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Any, Optional
from datetime import datetime

class DatabaseManager:
    """Gerenciador de conexão com MySQL"""
    
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Estabelece conexão com MySQL"""
        try:
            # Configuração do banco (ajuste conforme necessário)
            self.connection = mysql.connector.connect(
                host='localhost',
                database='db_infohub',
                user='root',
                password='bcd127',  # AJUSTE SUA SENHA AQUI
                port=3306,
                charset='utf8mb4',
                autocommit=True
            )
            
            if self.connection.is_connected():
                print("✅ Python conectado ao MySQL - db_infohub")
                return True
                
        except Error as e:
            print(f"❌ Erro ao conectar com MySQL: {e}")
            print("💡 Verifique se o MySQL está rodando e as credenciais estão corretas")
            self.connection = None
            return False
    
    def disconnect(self):
        """Fecha conexão"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("🔌 Conexão MySQL fechada")
    
    def buscar_promocoes_proximas(self, id_usuario: int, radius_km: int = 10, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        🏆 BUSCA TODAS AS MELHORES PROMOÇÕES PRÓXIMAS (SEM FILTRO DE PRODUTO)
        Para quando o usuário pergunta "quais as promoções?" genericamente
        """
        try:
            if not self.connection or not self.connection.is_connected():
                print("❌ Sem conexão com banco - tentando reconectar...")
                if not self.connect():
                    return []
            
            cursor = self.connection.cursor(dictionary=True)
            
            # 1. Busca coordenadas do usuário
            print(f"🔍 Buscando melhores promoções próximas ao usuário {id_usuario}...")
            
            user_coords_query = """
                SELECT latitude, longitude 
                FROM tbl_enderecoUsuario 
                WHERE id_usuario = %s
                ORDER BY id_endereco DESC
                LIMIT 1
            """
            
            cursor.execute(user_coords_query, (id_usuario,))
            user_coords = cursor.fetchone()
            
            if not user_coords or not user_coords['latitude'] or not user_coords['longitude']:
                print(f"⚠️ Usuário {id_usuario} sem endereço cadastrado")
                cursor.close()
                return []
            
            latitude = float(user_coords['latitude'])
            longitude = float(user_coords['longitude'])
            print(f"📍 Coordenadas do usuário: {latitude}, {longitude}")
            
            # 2. Busca TODAS as promoções válidas próximas
            hoje = datetime.now().strftime('%Y-%m-%d')
            print(f"📅 Buscando todas as promoções válidas para: {hoje}")
            
            # Query para buscar todas as promoções próximas
            promocoes_query = """
                SELECT 
                    promo.id_promocao,
                    prod.id_produto, 
                    prod.nome AS produto,
                    cat.nome AS categoria,
                    est.id_estabelecimento, 
                    est.nome AS estabelecimento,
                    endest.cidade, 
                    endest.estado,
                    endest.latitude, 
                    endest.longitude,
                    promo.preco_promocional, 
                    promo.data_inicio, 
                    promo.data_fim,
                    (
                        6371 * acos(
                            cos(radians(%s)) 
                            * cos(radians(endest.latitude)) 
                            * cos(radians(endest.longitude) - radians(%s)) 
                            + sin(radians(%s)) 
                            * sin(radians(endest.latitude))
                        )
                    ) AS distance_km
                FROM tbl_promocao AS promo
                JOIN tbl_produto AS prod ON prod.id_produto = promo.id_produto
                LEFT JOIN tbl_categoria AS cat ON cat.id_categoria = prod.id_categoria
                JOIN tbl_estabelecimento AS est ON est.id_estabelecimento = promo.id_estabelecimento
                JOIN tbl_enderecoEstabelecimento AS endest ON endest.id_estabelecimento = est.id_estabelecimento
                WHERE promo.data_inicio <= %s 
                    AND promo.data_fim >= %s
                HAVING distance_km <= %s
                ORDER BY promo.preco_promocional ASC, distance_km ASC
                LIMIT %s
            """
            
            params = (
                latitude, longitude, latitude,  # Para cálculo de distância
                hoje, hoje,                     # Datas válidas
                radius_km,                      # Raio máximo
                max_results                     # Limite de resultados
            )
            
            cursor.execute(promocoes_query, params)
            promocoes = cursor.fetchall()
            
            # 3. Formata resultados
            resultados = []
            for promo in promocoes:
                resultado = {
                    "id_promocao": promo['id_promocao'],
                    "produto": promo['produto'],
                    "categoria": promo['categoria'] or "Sem categoria",
                    "estabelecimento": promo['estabelecimento'],
                    "cidade": promo['cidade'],
                    "estado": promo['estado'],
                    "preco_promocional": float(promo['preco_promocional']) if promo['preco_promocional'] else 0.0,
                    "data_inicio": str(promo['data_inicio']),
                    "data_fim": str(promo['data_fim']),
                    "distance_km": round(float(promo['distance_km']), 1),
                    "preco_brl": f"R$ {float(promo['preco_promocional']):.2f}".replace('.', ',')
                }
                resultados.append(resultado)
            
            cursor.close()
            print(f"✅ Encontradas {len(resultados)} promoções próximas (raio {radius_km}km)")
            return resultados
            
        except Error as e:
            print(f"❌ Erro MySQL na busca geral: {e}")
            return []
        except Exception as e:
            print(f"❌ Erro geral na busca geral: {e}")
            return []

    def buscar_promocoes_real(self, termo_busca: str, id_usuario: int, radius_km: int = 10, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        🔍 BUSCA REAL DE PROMOÇÕES - MESMA LÓGICA DO DAO NODE.JS
        Esta é a função principal que o agente lightning chama
        """
        try:
            if not self.connection or not self.connection.is_connected():
                print("❌ Sem conexão com banco - tentando reconectar...")
                if not self.connect():
                    return []
            
            cursor = self.connection.cursor(dictionary=True)
            
            # 1. Busca coordenadas do usuário
            print(f"🔍 Buscando endereço do usuário {id_usuario}...")
            
            user_coords_query = """
                SELECT latitude, longitude 
                FROM tbl_enderecoUsuario 
                WHERE id_usuario = %s
                ORDER BY id_endereco DESC
                LIMIT 1
            """
            
            cursor.execute(user_coords_query, (id_usuario,))
            user_coords = cursor.fetchone()
            
            if not user_coords or not user_coords['latitude'] or not user_coords['longitude']:
                print(f"⚠️ Usuário {id_usuario} sem endereço cadastrado")
                cursor.close()
                return []
            
            latitude = float(user_coords['latitude'])
            longitude = float(user_coords['longitude'])
            print(f"📍 Coordenadas do usuário: {latitude}, {longitude}")
            
            # 2. Busca promoções com cálculo de distância
            hoje = datetime.now().strftime('%Y-%m-%d')
            print(f"📅 Buscando promoções válidas para: {hoje}")
            print(f"🔍 Termo de busca: '{termo_busca}'")
            
            # Busca mais flexível - tenta várias estratégias
            promocoes_query = """
                SELECT 
                    promo.id_promocao,
                    prod.id_produto, 
                    prod.nome AS produto,
                    cat.nome AS categoria,
                    est.id_estabelecimento, 
                    est.nome AS estabelecimento,
                    endest.cidade, 
                    endest.estado,
                    endest.latitude, 
                    endest.longitude,
                    promo.preco_promocional, 
                    promo.data_inicio, 
                    promo.data_fim,
                    (
                        6371 * acos(
                            cos(radians(%s)) 
                            * cos(radians(endest.latitude)) 
                            * cos(radians(endest.longitude) - radians(%s)) 
                            + sin(radians(%s)) 
                            * sin(radians(endest.latitude))
                        )
                    ) AS distance_km
                FROM tbl_promocao AS promo
                JOIN tbl_produto AS prod ON prod.id_produto = promo.id_produto
                LEFT JOIN tbl_categoria AS cat ON cat.id_categoria = prod.id_categoria
                JOIN tbl_estabelecimento AS est ON est.id_estabelecimento = promo.id_estabelecimento
                JOIN tbl_enderecoEstabelecimento AS endest ON endest.id_estabelecimento = est.id_estabelecimento
                WHERE promo.data_inicio <= %s 
                    AND promo.data_fim >= %s
                    AND (
                        prod.nome LIKE %s 
                        OR prod.nome LIKE %s
                        OR cat.nome LIKE %s
                    )
                HAVING distance_km <= %s
                ORDER BY promo.preco_promocional ASC, distance_km ASC
                LIMIT %s
            """
            
            # Prepara parâmetros com busca mais flexível
            termo_exato = f"%{termo_busca}%"
            termo_flexivel = f"%{termo_busca[:4]}%" if len(termo_busca) > 4 else termo_exato
            categoria_busca = f"%{termo_busca}%"
            
            params = (
                latitude, longitude, latitude,  # Para cálculo de distância
                hoje, hoje,                     # Datas válidas
                termo_exato,                    # Busca exata no produto
                termo_flexivel,                 # Busca flexível no produto
                categoria_busca,                # Busca na categoria
                radius_km,                      # Raio máximo
                max_results                     # Limite de resultados
            )
            
            cursor.execute(promocoes_query, params)
            promocoes = cursor.fetchall()
            
            # 3. Formata resultados
            resultados = []
            for promo in promocoes:
                resultado = {
                    "id_promocao": promo['id_promocao'],
                    "produto": promo['produto'],
                    "categoria": promo['categoria'] or "Sem categoria",
                    "estabelecimento": promo['estabelecimento'],
                    "cidade": promo['cidade'],
                    "estado": promo['estado'],
                    "preco_promocional": float(promo['preco_promocional']) if promo['preco_promocional'] else 0.0,
                    "data_inicio": str(promo['data_inicio']),
                    "data_fim": str(promo['data_fim']),
                    "distance_km": round(float(promo['distance_km']), 1),
                    "preco_brl": f"R$ {float(promo['preco_promocional']):.2f}".replace('.', ',')
                }
                resultados.append(resultado)
            
            cursor.close()
            print(f"✅ Encontradas {len(resultados)} promoções para '{termo_busca}'")
            return resultados
            
        except Error as e:
            print(f"❌ Erro MySQL na busca: {e}")
            return []
        except Exception as e:
            print(f"❌ Erro geral na busca: {e}")
            return []

# Instância global que será usada pelo agente
db_manager = DatabaseManager()

def get_db_connection():
    """
    Função helper para obter conexão com o banco
    Compatível com as funções do enhanced_agent
    """
    try:
        import mysql.connector
        
        connection = mysql.connector.connect(
            host='localhost',
            database='db_infohub',
            user='root',
            password='bcd127',
            port=3306,
            charset='utf8mb4',
            autocommit=True
        )
        
        if connection.is_connected():
            return connection
        else:
            return None
            
    except Exception as e:
        print(f"❌ Erro ao conectar com MySQL: {e}")
        return None