-- ====================================
-- 🤖 CONSULTAS PARA TESTAR A IA GROQ
-- ====================================
-- Execute estas consultas para verificar se os dados estão corretos

USE db_infohub;

-- ====================================
-- 📊 ESTATÍSTICAS GERAIS
-- ====================================

-- Total de usuários
SELECT COUNT(*) as total_usuarios FROM tbl_usuario;

-- Total de produtos
SELECT COUNT(*) as total_produtos FROM tbl_produto;

-- Total de estabelecimentos
SELECT COUNT(*) as total_estabelecimentos FROM tbl_estabelecimento;

-- Total de promoções ativas
SELECT COUNT(*) as promocoes_ativas 
FROM tbl_promocao 
WHERE data_fim >= CURDATE();

-- ====================================
-- 👥 INFORMAÇÕES DE USUÁRIOS
-- ====================================

-- Listar todos os usuários (sem dados sensíveis)
SELECT 
    id_usuario,
    nome,
    email,
    perfil,
    telefone,
    data_nascimento,
    data_criacao
FROM tbl_usuario
ORDER BY data_criacao DESC;

-- Usuários por perfil
SELECT 
    perfil,
    COUNT(*) as quantidade
FROM tbl_usuario
GROUP BY perfil;

-- ====================================
-- 🛍️ PRODUTOS E CATEGORIAS
-- ====================================

-- Produtos por categoria
SELECT 
    c.nome as categoria,
    COUNT(p.id_produto) as total_produtos
FROM tbl_categoria c
LEFT JOIN tbl_produto p ON c.id_categoria = p.id_categoria
GROUP BY c.id_categoria, c.nome
ORDER BY total_produtos DESC;

-- Lista completa de produtos com categoria
SELECT 
    p.id_produto,
    p.nome as produto,
    p.descricao,
    c.nome as categoria
FROM tbl_produto p
JOIN tbl_categoria c ON p.id_categoria = c.id_categoria
ORDER BY c.nome, p.nome;

-- ====================================
-- 🔥 PROMOÇÕES ATIVAS
-- ====================================

-- Todas as promoções ativas
SELECT 
    p.nome as produto,
    e.nome as estabelecimento,
    pr.preco_promocional,
    pr.data_inicio,
    pr.data_fim,
    DATEDIFF(pr.data_fim, CURDATE()) as dias_restantes
FROM tbl_promocao pr
JOIN tbl_produto p ON pr.id_produto = p.id_produto
JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
WHERE pr.data_fim >= CURDATE()
ORDER BY pr.preco_promocional ASC;

-- Melhores promoções (menor preço)
SELECT 
    p.nome as produto,
    e.nome as estabelecimento,
    pr.preco_promocional as preco_promocao,
    pp.preco as preco_normal,
    ROUND(((pp.preco - pr.preco_promocional) / pp.preco) * 100, 1) as desconto_percentual
FROM tbl_promocao pr
JOIN tbl_produto p ON pr.id_produto = p.id_produto
JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento
JOIN tbl_precoProduto pp ON pr.id_produto = pp.id_produto AND pr.id_estabelecimento = pp.id_estabelecimento
WHERE pr.data_fim >= CURDATE()
ORDER BY desconto_percentual DESC
LIMIT 10;

-- ====================================
-- 💰 COMPARAÇÃO DE PREÇOS
-- ====================================

-- Preços do leite em todos os estabelecimentos
SELECT 
    p.nome as produto,
    e.nome as estabelecimento,
    COALESCE(pr.preco_promocional, pp.preco) as preco_atual,
    CASE 
        WHEN pr.preco_promocional IS NOT NULL THEN 'PROMOÇÃO'
        ELSE 'PREÇO NORMAL'
    END as tipo_preco
FROM tbl_produto p
JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto
JOIN tbl_estabelecimento e ON pp.id_estabelecimento = e.id_estabelecimento
LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
    AND e.id_estabelecimento = pr.id_estabelecimento 
    AND pr.data_fim >= CURDATE()
WHERE p.nome LIKE '%Leite%'
ORDER BY preco_atual ASC;

-- Produtos mais baratos por categoria
SELECT 
    c.nome as categoria,
    p.nome as produto,
    e.nome as estabelecimento,
    MIN(COALESCE(pr.preco_promocional, pp.preco)) as menor_preco
FROM tbl_categoria c
JOIN tbl_produto p ON c.id_categoria = p.id_categoria
JOIN tbl_precoProduto pp ON p.id_produto = pp.id_produto
JOIN tbl_estabelecimento e ON pp.id_estabelecimento = e.id_estabelecimento
LEFT JOIN tbl_promocao pr ON p.id_produto = pr.id_produto 
    AND e.id_estabelecimento = pr.id_estabelecimento 
    AND pr.data_fim >= CURDATE()
GROUP BY c.id_categoria, c.nome
ORDER BY c.nome;

-- ====================================
-- 🏪 ESTABELECIMENTOS
-- ====================================

-- Lista de estabelecimentos com endereços
SELECT 
    e.id_estabelecimento,
    e.nome,
    e.cnpj,
    e.telefone,
    CONCAT(ee.logradouro, ', ', ee.numero, ' - ', ee.bairro, ', ', ee.cidade, '/', ee.estado) as endereco_completo
FROM tbl_estabelecimento e
LEFT JOIN tbl_enderecoEstabelecimento ee ON e.id_estabelecimento = ee.id_estabelecimento
ORDER BY e.nome;

-- Estabelecimentos com mais produtos
SELECT 
    e.nome as estabelecimento,
    COUNT(DISTINCT pp.id_produto) as total_produtos
FROM tbl_estabelecimento e
JOIN tbl_precoProduto pp ON e.id_estabelecimento = pp.id_estabelecimento
GROUP BY e.id_estabelecimento, e.nome
ORDER BY total_produtos DESC;

-- ====================================
-- ❤️ PRODUTOS FAVORITOS
-- ====================================

-- Produtos mais favoritados
SELECT 
    p.nome as produto,
    c.nome as categoria,
    COUNT(f.id_favorito) as total_favoritos
FROM tbl_produto p
JOIN tbl_categoria c ON p.id_categoria = c.id_categoria
LEFT JOIN tbl_favorito f ON p.id_produto = f.id_produto
GROUP BY p.id_produto, p.nome, c.nome
HAVING total_favoritos > 0
ORDER BY total_favoritos DESC;

-- ====================================
-- 🛒 LISTAS DE COMPRAS
-- ====================================

-- Produtos mais adicionados em listas
SELECT 
    p.nome as produto,
    c.nome as categoria,
    COUNT(il.id_item) as vezes_na_lista,
    SUM(il.quantidade) as quantidade_total
FROM tbl_produto p
JOIN tbl_categoria c ON p.id_categoria = c.id_categoria
LEFT JOIN tbl_itemLista il ON p.id_produto = il.id_produto
GROUP BY p.id_produto, p.nome, c.nome
HAVING vezes_na_lista > 0
ORDER BY vezes_na_lista DESC;

-- ====================================
-- 🧪 PERGUNTAS PARA TESTAR A IA
-- ====================================

/*
TESTE SUA IA COM ESTAS PERGUNTAS:

1. "Quantos usuários eu tenho cadastrados?"
2. "Quais produtos estão em promoção hoje?"
3. "Qual o preço do leite?"
4. "Mostre os produtos da categoria laticínios"
5. "Quantos estabelecimentos tenho?"
6. "Qual o produto mais barato?"
7. "Quais são os produtos favoritos dos usuários?"
8. "Mostre as melhores promoções"
9. "Quantos produtos de limpeza eu tenho?"
10. "Qual estabelecimento tem mais produtos?"
11. "Mostre os usuários cadastrados"
12. "Quais medicamentos estão disponíveis?"
13. "Qual a promoção com maior desconto?"
14. "Quantas categorias de produtos existem?"
15. "Mostre os produtos mais caros"

*/
