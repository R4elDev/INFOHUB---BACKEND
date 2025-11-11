-- =============================================
-- NOVAS TABELAS - CARRINHO E COMPRAS
-- InfoHub Backend - Sistema Completo
-- =============================================

USE db_infohub;

-- Tabela para carrinho de compras
CREATE TABLE IF NOT EXISTS tbl_carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT DEFAULT 1,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (id_usuario, id_produto)
);

-- Tabela para compras realizadas
CREATE TABLE IF NOT EXISTS tbl_compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status_compra ENUM('pendente','confirmada','processando','enviada','entregue','cancelada') DEFAULT 'pendente',
    metodo_pagamento VARCHAR(50),
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP NULL,
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario),
    CONSTRAINT fk_compra_estabelecimento FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento)
);

-- Tabela para itens de cada compra
CREATE TABLE IF NOT EXISTS tbl_itemCompra (
    id_item_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_compra FOREIGN KEY (id_compra) REFERENCES tbl_compra(id_compra) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto_compra FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto)
);

-- Tabela para avaliações de produtos e estabelecimentos
CREATE TABLE IF NOT EXISTS tbl_avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NULL,
    id_estabelecimento INT NULL,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario),
    CONSTRAINT fk_avaliacao_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto),
    CONSTRAINT fk_avaliacao_estabelecimento FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento),
    CONSTRAINT check_avaliacao_target CHECK (id_produto IS NOT NULL OR id_estabelecimento IS NOT NULL)
);

-- Atualizar tabela de notificações para incluir novos tipos
ALTER TABLE tbl_notificacao 
MODIFY COLUMN tipo ENUM('promocao','alerta','social','compra','carrinho');

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para carrinho
CREATE INDEX idx_carrinho_usuario ON tbl_carrinho(id_usuario);
CREATE INDEX idx_carrinho_produto ON tbl_carrinho(id_produto);

-- Índices para compras
CREATE INDEX idx_compra_usuario ON tbl_compra(id_usuario);
CREATE INDEX idx_compra_estabelecimento ON tbl_compra(id_estabelecimento);
CREATE INDEX idx_compra_data ON tbl_compra(data_compra);
CREATE INDEX idx_compra_status ON tbl_compra(status_compra);

-- Índices para itens de compra
CREATE INDEX idx_item_compra ON tbl_itemCompra(id_compra);
CREATE INDEX idx_item_produto ON tbl_itemCompra(id_produto);

-- Índices para avaliações
CREATE INDEX idx_avaliacao_usuario ON tbl_avaliacao(id_usuario);
CREATE INDEX idx_avaliacao_produto ON tbl_avaliacao(id_produto);
CREATE INDEX idx_avaliacao_estabelecimento ON tbl_avaliacao(id_estabelecimento);

-- =============================================
-- TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS
-- =============================================

-- Trigger para notificar quando favoritos entram em promoção
DELIMITER //
CREATE TRIGGER tr_notificar_promocao_favorito
AFTER INSERT ON tbl_promocao
FOR EACH ROW
BEGIN
    INSERT INTO tbl_notificacao (id_usuario, mensagem, tipo)
    SELECT 
        f.id_usuario,
        CONCAT('🔥 Seu produto favorito "', p.nome, '" está em promoção por R$ ', NEW.preco_promocional, '!'),
        'promocao'
    FROM tbl_favorito f
    INNER JOIN tbl_produto p ON f.id_produto = p.id_produto
    WHERE f.id_produto = NEW.id_produto;
END//

-- Trigger para notificar carrinho abandonado (depois de 24h sem modificação)
-- Este será implementado via cronjob ou scheduled task

-- Trigger para calcular subtotal automaticamente
CREATE TRIGGER tr_calcular_subtotal_item_compra
BEFORE INSERT ON tbl_itemCompra
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.quantidade * NEW.preco_unitario;
END//

CREATE TRIGGER tr_atualizar_subtotal_item_compra
BEFORE UPDATE ON tbl_itemCompra
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.quantidade * NEW.preco_unitario;
END//

DELIMITER ;

-- =============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =============================================

-- View para produtos mais vendidos
CREATE VIEW vw_produtos_mais_vendidos AS
SELECT 
    p.id_produto,
    p.nome,
    SUM(ic.quantidade) as total_vendido,
    AVG(a.nota) as avaliacao_media,
    COUNT(DISTINCT c.id_compra) as total_compras
FROM tbl_produto p
LEFT JOIN tbl_itemCompra ic ON p.id_produto = ic.id_produto
LEFT JOIN tbl_compra c ON ic.id_compra = c.id_compra AND c.status_compra = 'entregue'
LEFT JOIN tbl_avaliacao a ON p.id_produto = a.id_produto
GROUP BY p.id_produto, p.nome;

-- View para histórico de compras do usuário
CREATE VIEW vw_historico_compras AS
SELECT 
    c.id_compra,
    c.id_usuario,
    u.nome as nome_usuario,
    e.nome as nome_estabelecimento,
    c.valor_total,
    c.status_compra,
    c.data_compra,
    COUNT(ic.id_item_compra) as total_itens
FROM tbl_compra c
INNER JOIN tbl_usuario u ON c.id_usuario = u.id_usuario
INNER JOIN tbl_estabelecimento e ON c.id_estabelecimento = e.id_estabelecimento
LEFT JOIN tbl_itemCompra ic ON c.id_compra = ic.id_compra
GROUP BY c.id_compra;

-- =============================================
-- DADOS DE TESTE (OPCIONAL)
-- =============================================

-- Alguns dados de exemplo para testar
INSERT IGNORE INTO tbl_categoria (nome) VALUES 
('Alimentação'), ('Bebidas'), ('Higiene'), ('Limpeza'), ('Eletrônicos');

INSERT IGNORE INTO tbl_produto (nome, descricao, id_categoria) VALUES 
('Leite Integral 1L', 'Leite integral marca premium', 1),
('Pão de Forma', 'Pão de forma tradicional', 1),
('Refrigerante Cola 2L', 'Refrigerante sabor cola', 2),
('Sabonete Líquido', 'Sabonete líquido neutro', 3),
('Detergente Líquido', 'Detergente concentrado', 4);

-- Verificar se as tabelas foram criadas corretamente
SELECT 'Carrinho' as tabela, COUNT(*) as registros FROM tbl_carrinho
UNION ALL
SELECT 'Compras', COUNT(*) FROM tbl_compra
UNION ALL
SELECT 'Itens Compra', COUNT(*) FROM tbl_itemCompra
UNION ALL
SELECT 'Avaliações', COUNT(*) FROM tbl_avaliacao;