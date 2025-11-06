-- ====================================
-- 🧪 DADOS DE TESTE PARA IA GROQ
-- ====================================
-- Execute este script após criar as tabelas com dbinfohub.sql

USE db_infohub;

-- ====================================
-- 👥 USUÁRIOS DE TESTE
-- ====================================
INSERT INTO tbl_usuario (nome, email, senha_hash, perfil, cpf, telefone, data_nascimento) VALUES
('João Silva', 'joao@email.com', '$2b$10$hash1', 'consumidor', '123.456.789-01', '(11) 99999-1111', '1990-05-15'),
('Maria Santos', 'maria@email.com', '$2b$10$hash2', 'consumidor', '987.654.321-02', '(11) 99999-2222', '1985-08-22'),
('Pedro Admin', 'admin@infohub.com', '$2b$10$hash3', 'admin', '111.222.333-44', '(11) 99999-3333', '1980-12-10'),
('Ana Costa', 'ana@email.com', '$2b$10$hash4', 'consumidor', '555.666.777-88', '(11) 99999-4444', '1995-03-18'),
('Carlos Oliveira', 'carlos@email.com', '$2b$10$hash5', 'consumidor', '999.888.777-66', '(11) 99999-5555', '1988-11-25');

-- ====================================
-- 🏪 ESTABELECIMENTOS
-- ====================================
INSERT INTO tbl_estabelecimento (nome, cnpj, telefone) VALUES
('Supermercado Bom Preço', '12.345.678/0001-90', '(11) 3333-1111'),
('Farmácia Saúde Total', '98.765.432/0001-10', '(11) 3333-2222'),
('Mercadinho do Bairro', '11.222.333/0001-44', '(11) 3333-3333'),
('Drogaria Popular', '55.666.777/0001-88', '(11) 3333-4444'),
('Atacadão Central', '99.888.777/0001-66', '(11) 3333-5555');

-- ====================================
-- 📦 CATEGORIAS
-- ====================================
INSERT INTO tbl_categoria (nome) VALUES
('Alimentação'),
('Higiene e Beleza'),
('Limpeza'),
('Medicamentos'),
('Bebidas'),
('Laticínios'),
('Carnes e Frios'),
('Padaria'),
('Frutas e Verduras'),
('Eletrônicos');

-- ====================================
-- 🛍️ PRODUTOS (inserir APÓS as categorias)
-- ====================================
-- Verificar se as categorias existem primeiro
SELECT 'Verificando categorias...' as status;
SELECT id_categoria, nome FROM tbl_categoria ORDER BY id_categoria;

INSERT INTO tbl_produto (nome, descricao, id_categoria) VALUES
-- Alimentação (id_categoria = 1)
('Arroz Branco 5kg', 'Arroz branco tipo 1, pacote de 5kg', 1),
('Feijão Preto 1kg', 'Feijão preto selecionado, pacote de 1kg', 1),
('Açúcar Cristal 1kg', 'Açúcar cristal refinado, pacote de 1kg', 1),
('Óleo de Soja 900ml', 'Óleo de soja refinado, garrafa de 900ml', 1),
('Macarrão Espaguete 500g', 'Macarrão espaguete, pacote de 500g', 1),

-- Laticínios (id_categoria = 6)
('Leite Integral 1L', 'Leite integral UHT, caixa de 1 litro', 6),
('Iogurte Natural 170g', 'Iogurte natural cremoso, pote de 170g', 6),
('Queijo Mussarela 400g', 'Queijo mussarela fatiado, pacote de 400g', 6),
('Manteiga 200g', 'Manteiga com sal, pote de 200g', 6),
('Requeijão 250g', 'Requeijão cremoso, pote de 250g', 6),

-- Higiene e Beleza (id_categoria = 2)
('Shampoo Anticaspa 400ml', 'Shampoo anticaspa para todos os tipos de cabelo', 2),
('Sabonete Líquido 250ml', 'Sabonete líquido hidratante, refil de 250ml', 2),
('Pasta de Dente 90g', 'Pasta de dente com flúor, tubo de 90g', 2),
('Desodorante Aerosol 150ml', 'Desodorante antitranspirante, aerosol 150ml', 2),

-- Limpeza (id_categoria = 3)
('Detergente Neutro 500ml', 'Detergente líquido neutro, frasco de 500ml', 3),
('Sabão em Pó 1kg', 'Sabão em pó concentrado, caixa de 1kg', 3),
('Desinfetante 1L', 'Desinfetante multiuso, frasco de 1 litro', 3),
('Papel Higiênico 12 rolos', 'Papel higiênico folha dupla, pacote com 12 rolos', 3),

-- Bebidas (id_categoria = 5)
('Refrigerante Cola 2L', 'Refrigerante sabor cola, garrafa de 2 litros', 5),
('Suco de Laranja 1L', 'Suco de laranja integral, caixa de 1 litro', 5),
('Água Mineral 1,5L', 'Água mineral natural, garrafa de 1,5 litros', 5),
('Cerveja Lata 350ml', 'Cerveja pilsen, lata de 350ml', 5),

-- Medicamentos (id_categoria = 4)
('Dipirona 500mg', 'Dipirona sódica 500mg, caixa com 20 comprimidos', 4),
('Paracetamol 750mg', 'Paracetamol 750mg, caixa com 20 comprimidos', 4),
('Vitamina C 1g', 'Vitamina C efervescente, caixa com 10 comprimidos', 4);

-- Verificar produtos inseridos
SELECT 'Produtos inseridos:' as status;
SELECT COUNT(*) as total_produtos FROM tbl_produto;

-- ====================================
-- 💰 PREÇOS NORMAIS
-- ====================================
INSERT INTO tbl_precoProduto (id_produto, id_estabelecimento, preco) VALUES
-- Arroz (produto 1)
(1, 1, 18.90), (1, 2, 19.50), (1, 3, 17.80), (1, 4, 20.00), (1, 5, 16.90),
-- Feijão (produto 2)
(2, 1, 8.50), (2, 2, 9.00), (2, 3, 8.20), (2, 4, 9.50), (2, 5, 7.90),
-- Leite (produto 6)
(6, 1, 4.50), (6, 2, 4.80), (6, 3, 4.20), (6, 4, 5.00), (6, 5, 4.10),
-- Shampoo (produto 11)
(11, 1, 12.90), (11, 2, 15.50), (11, 3, 11.80), (11, 4, 16.00), (11, 5, 10.90),
-- Refrigerante (produto 19)
(19, 1, 6.50), (19, 2, 7.00), (19, 3, 6.20), (19, 4, 7.50), (19, 5, 5.90),
-- Dipirona (produto 23)
(23, 2, 8.50), (23, 4, 9.20), (23, 1, 7.80);

-- ====================================
-- 🔥 PROMOÇÕES ATIVAS
-- ====================================
INSERT INTO tbl_promocao (id_produto, id_estabelecimento, preco_promocional, data_inicio, data_fim) VALUES
-- Promoções válidas (até dezembro 2025)
(1, 5, 14.90, '2025-11-01', '2025-12-31'), -- Arroz no Atacadão
(6, 3, 3.50, '2025-11-01', '2025-11-30'),  -- Leite no Mercadinho
(11, 5, 8.90, '2025-11-01', '2025-12-15'), -- Shampoo no Atacadão
(19, 1, 4.99, '2025-11-01', '2025-11-30'), -- Refrigerante no Supermercado
(2, 3, 6.50, '2025-11-01', '2025-12-31'),  -- Feijão no Mercadinho
(23, 2, 6.90, '2025-11-01', '2025-12-31'), -- Dipirona na Farmácia
(10, 1, 1.99, '2025-11-01', '2025-11-30'), -- Requeijão em promoção
(15, 2, 2.50, '2025-11-01', '2025-12-15'), -- Detergente em promoção
(20, 4, 2.80, '2025-11-01', '2025-11-30'), -- Suco em promoção
(7, 5, 2.99, '2025-11-01', '2025-12-31');  -- Iogurte em promoção

-- ====================================
-- 📍 ENDEREÇOS DOS USUÁRIOS
-- ====================================
INSERT INTO tbl_enderecoUsuario (id_usuario, cep, logradouro, numero, bairro, cidade, estado, latitude, longitude) VALUES
(1, '01310-100', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', -23.5613, -46.6565),
(2, '04038-001', 'Rua Vergueiro', '500', 'Vila Mariana', 'São Paulo', 'SP', -23.5890, -46.6394),
(3, '01451-000', 'Rua Augusta', '200', 'Consolação', 'São Paulo', 'SP', -23.5558, -46.6659),
(4, '05407-002', 'Rua Cardeal Arcoverde', '300', 'Pinheiros', 'São Paulo', 'SP', -23.5629, -46.6944),
(5, '04567-001', 'Av. Ibirapuera', '800', 'Moema', 'São Paulo', 'SP', -23.5934, -46.6640);

-- ====================================
-- 📍 ENDEREÇOS DOS ESTABELECIMENTOS
-- ====================================
INSERT INTO tbl_enderecoEstabelecimento (id_estabelecimento, cep, logradouro, numero, bairro, cidade, estado, latitude, longitude) VALUES
(1, '01310-200', 'Av. Paulista', '1500', 'Bela Vista', 'São Paulo', 'SP', -23.5615, -46.6560),
(2, '04038-100', 'Rua Vergueiro', '800', 'Vila Mariana', 'São Paulo', 'SP', -23.5885, -46.6390),
(3, '01451-100', 'Rua Augusta', '400', 'Consolação', 'São Paulo', 'SP', -23.5555, -46.6655),
(4, '05407-100', 'Rua Cardeal Arcoverde', '600', 'Pinheiros', 'São Paulo', 'SP', -23.5625, -46.6940),
(5, '04567-100', 'Av. Ibirapuera', '1200', 'Moema', 'São Paulo', 'SP', -23.5930, -46.6635);

-- ====================================
-- ❤️ PRODUTOS FAVORITOS
-- ====================================
INSERT INTO tbl_favorito (id_usuario, id_produto) VALUES
(1, 1), (1, 6), (1, 11), -- João gosta de arroz, leite e shampoo
(2, 2), (2, 7), (2, 19), -- Maria gosta de feijão, iogurte e refrigerante
(4, 6), (4, 10), (4, 23), -- Ana gosta de leite, requeijão e dipirona
(5, 1), (5, 2), (5, 19); -- Carlos gosta de arroz, feijão e refrigerante

-- ====================================
-- 🛒 LISTAS DE COMPRAS
-- ====================================
INSERT INTO tbl_listaCompra (id_usuario, nome_lista) VALUES
(1, 'Compras do Mês'),
(2, 'Lista da Semana'),
(4, 'Emergência');

INSERT INTO tbl_itemLista (id_lista, id_produto, quantidade) VALUES
-- Lista do João
(1, 1, 2), (1, 6, 5), (1, 11, 1),
-- Lista da Maria
(2, 2, 1), (2, 7, 3), (2, 19, 2),
-- Lista da Ana
(3, 23, 1), (3, 6, 2);

-- ====================================
-- 📊 CONSULTAS ÚTEIS PARA TESTAR A IA
-- ====================================

-- Ver todos os usuários
-- SELECT COUNT(*) as total_usuarios FROM tbl_usuario;

-- Ver produtos em promoção
-- SELECT p.nome, pr.preco_promocional, e.nome as estabelecimento 
-- FROM tbl_promocao pr 
-- JOIN tbl_produto p ON pr.id_produto = p.id_produto 
-- JOIN tbl_estabelecimento e ON pr.id_estabelecimento = e.id_estabelecimento 
-- WHERE pr.data_fim >= CURDATE();

-- Ver produtos por categoria
-- SELECT c.nome as categoria, COUNT(p.id_produto) as total_produtos 
-- FROM tbl_categoria c 
-- LEFT JOIN tbl_produto p ON c.id_categoria = p.id_categoria 
-- GROUP BY c.id_categoria;

COMMIT;

-- ====================================
-- ✅ DADOS INSERIDOS COM SUCESSO!
-- ====================================
-- Agora você pode testar sua IA com perguntas como:
-- - "Quantos usuários tenho cadastrados?"
-- - "Quais produtos estão em promoção?"
-- - "Mostre os produtos da categoria laticínios"
-- - "Qual o preço do leite?"
-- - "Quantos estabelecimentos tenho?"
-- ====================================
