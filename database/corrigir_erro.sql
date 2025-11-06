-- ====================================
-- 🔧 CORREÇÃO DO ERRO DE FOREIGN KEY
-- ====================================

USE db_infohub;

-- 1. Verificar se as categorias existem
SELECT 'VERIFICANDO CATEGORIAS EXISTENTES:' as status;
SELECT id_categoria, nome FROM tbl_categoria ORDER BY id_categoria;

-- 2. Se não existirem, inserir as categorias primeiro
INSERT IGNORE INTO tbl_categoria (nome) VALUES
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

-- 3. Verificar categorias após inserção
SELECT 'CATEGORIAS APÓS INSERÇÃO:' as status;
SELECT id_categoria, nome FROM tbl_categoria ORDER BY id_categoria;

-- 4. Agora inserir os produtos (vai funcionar)
INSERT IGNORE INTO tbl_produto (nome, descricao, id_categoria) VALUES
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

-- 5. Verificar resultado
SELECT 'RESULTADO FINAL:' as status;
SELECT 
    (SELECT COUNT(*) FROM tbl_categoria) as total_categorias,
    (SELECT COUNT(*) FROM tbl_produto) as total_produtos;

SELECT '✅ ERRO CORRIGIDO! Agora execute o resto do script dados_teste.sql' as resultado;
