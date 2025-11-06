-- ====================================
-- 🚀 SETUP COMPLETO DO BANCO DE DADOS
-- ====================================
-- Execute este arquivo para criar tudo de uma vez

-- 1. Criar banco e tabelas
SOURCE dbinfohub.sql;

-- 2. Inserir dados de teste
SOURCE dados_teste.sql;

-- 3. Verificar se tudo foi criado
USE db_infohub;

SELECT 'TABELAS CRIADAS:' as status;
SHOW TABLES;

SELECT 'DADOS INSERIDOS:' as status;
SELECT 
    (SELECT COUNT(*) FROM tbl_usuario) as usuarios,
    (SELECT COUNT(*) FROM tbl_produto) as produtos,
    (SELECT COUNT(*) FROM tbl_estabelecimento) as estabelecimentos,
    (SELECT COUNT(*) FROM tbl_promocao WHERE data_fim >= CURDATE()) as promocoes_ativas;

SELECT '✅ SETUP COMPLETO! PRONTO PARA TESTAR A IA!' as resultado;
