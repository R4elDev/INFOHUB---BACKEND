create database db_infohub;
use db_infohub;

show tables;

CREATE TABLE tbl_usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('consumidor','admin','estabelecimento') DEFAULT 'consumidor',
    cpf VARCHAR(14) UNIQUE, -- formato: 000.000.000-00
    cnpj VARCHAR(18) UNIQUE, -- formato: 00.000.000/0000-00
    telefone VARCHAR(20) UNIQUE,
    data_nascimento DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from tbl_usuario;


CREATE TABLE tbl_enderecoUsuario (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(60),
    cidade VARCHAR(60),
    estado CHAR(2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    CONSTRAINT fk_usuario_endereco FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_estabelecimento (
    id_estabelecimento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_enderecoEstabelecimento (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    id_estabelecimento INT NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(60),
    cidade VARCHAR(60),
    estado CHAR(2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    CONSTRAINT fk_estab_endereco FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento)
);

CREATE TABLE tbl_categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE tbl_produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    id_categoria INT,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES tbl_categoria(id_categoria)
);

CREATE TABLE tbl_precoProduto (
    id_preco INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_preco_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto),
    CONSTRAINT fk_preco_estab FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento)
);

CREATE TABLE tbl_promocao (
    id_promocao INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    preco_promocional DECIMAL(10,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    CONSTRAINT fk_promocao_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto),
    CONSTRAINT fk_promocao_estab FOREIGN KEY (id_estabelecimento) REFERENCES tbl_estabelecimento(id_estabelecimento)
);

CREATE TABLE tbl_post (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150),
    conteudo TEXT,
    imagem VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coment_post FOREIGN KEY (id_post) REFERENCES tbl_post(id_post),
    CONSTRAINT fk_coment_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_curtida (
    id_curtida INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_like_post FOREIGN KEY (id_post) REFERENCES tbl_post(id_post),
    CONSTRAINT fk_like_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_compartilhamento (
    id_compartilhamento INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    data_compartilhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_share_post FOREIGN KEY (id_post) REFERENCES tbl_post(id_post),
    CONSTRAINT fk_share_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_favorito (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario),
    CONSTRAINT fk_fav_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto)
);

CREATE TABLE tbl_notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensagem VARCHAR(255) NOT NULL,
    tipo ENUM('promocao','alerta','social'),
    lida BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_recomendacao (
    id_recomendacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    motivo VARCHAR(255),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recom_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario),
    CONSTRAINT fk_recom_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto)
);

CREATE TABLE tbl_listaCompra (
    id_lista INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome_lista VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lista_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

CREATE TABLE tbl_itemLista (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_lista INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT DEFAULT 1,
    CONSTRAINT fk_item_lista FOREIGN KEY (id_lista) REFERENCES tbl_listaCompra(id_lista),
    CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES tbl_produto(id_produto)
);

CREATE TABLE tbl_recuperacaoSenha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_recuperacao FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario)
);

-- =============================================
-- NOVAS TABELAS - CARRINHO E COMPRAS
-- InfoHub Backend - Sistema Completo
-- =============================================

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
-- TABELA INFOCASH - SISTEMA DE PONTOS
-- =============================================

-- Tabela para gerenciar pontos InfoCash dos usuários
CREATE TABLE IF NOT EXISTS tbl_infocash (
    id_transacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_acao ENUM('avaliacao_promocao','cadastro_produto','avaliacao_empresa') NOT NULL,
    pontos INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referencia_id INT NULL, -- ID da avaliação, produto ou empresa relacionada
    CONSTRAINT fk_infocash_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela para armazenar saldo atual de cada usuário (para performance)
CREATE TABLE IF NOT EXISTS tbl_saldo_infocash (
    id_usuario INT PRIMARY KEY,
    saldo_total INT DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saldo_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario) ON DELETE CASCADE
);

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

-- Índices para infocash
CREATE INDEX idx_infocash_usuario ON tbl_infocash(id_usuario);
CREATE INDEX idx_infocash_tipo ON tbl_infocash(tipo_acao);
CREATE INDEX idx_infocash_data ON tbl_infocash(data_transacao);

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

-- =============================================
-- TRIGGERS PARA SISTEMA INFOCASH
-- =============================================

-- Trigger para conceder pontos quando avaliar uma promoção
CREATE TRIGGER tr_infocash_avaliacao_promocao
AFTER INSERT ON tbl_avaliacao
FOR EACH ROW
BEGIN
    DECLARE pontos_ganhos INT DEFAULT 0;
    
    -- Se avaliou um produto (pode estar em promoção)
    IF NEW.id_produto IS NOT NULL THEN
        -- Verifica se o produto tem promoção ativa
        IF EXISTS (SELECT 1 FROM tbl_promocao WHERE id_produto = NEW.id_produto AND data_fim >= NOW()) THEN
            SET pontos_ganhos = 15; -- 15 pontos por avaliar produto em promoção
            
            INSERT INTO tbl_infocash (id_usuario, tipo_acao, pontos, descricao, referencia_id)
            VALUES (NEW.id_usuario, 'avaliacao_promocao', pontos_ganhos, 
                   'Pontos ganhos por avaliar produto em promoção', NEW.id_avaliacao);
        END IF;
    END IF;
    
    -- Se avaliou um estabelecimento
    IF NEW.id_estabelecimento IS NOT NULL THEN
        SET pontos_ganhos = 10; -- 10 pontos por avaliar estabelecimento
        
        INSERT INTO tbl_infocash (id_usuario, tipo_acao, pontos, descricao, referencia_id)
        VALUES (NEW.id_usuario, 'avaliacao_empresa', pontos_ganhos, 
               'Pontos ganhos por avaliar estabelecimento', NEW.id_avaliacao);
    END IF;
    
    -- Atualizar saldo do usuário
    IF pontos_ganhos > 0 THEN
        INSERT INTO tbl_saldo_infocash (id_usuario, saldo_total)
        VALUES (NEW.id_usuario, pontos_ganhos)
        ON DUPLICATE KEY UPDATE saldo_total = saldo_total + pontos_ganhos;
    END IF;
END//

-- Trigger para conceder pontos quando cadastrar produto (se usuário for estabelecimento)
CREATE TRIGGER tr_infocash_cadastro_produto
AFTER INSERT ON tbl_produto
FOR EACH ROW
BEGIN
    DECLARE id_usuario_estabelecimento INT;
    DECLARE pontos_ganhos INT DEFAULT 5; -- 5 pontos por cadastrar produto
    
    -- Buscar o usuário responsável pelo estabelecimento
    SELECT id_usuario INTO id_usuario_estabelecimento 
    FROM tbl_estabelecimento 
    WHERE id_estabelecimento = NEW.id_estabelecimento 
    LIMIT 1;
    
    IF id_usuario_estabelecimento IS NOT NULL THEN
        INSERT INTO tbl_infocash (id_usuario, tipo_acao, pontos, descricao, referencia_id)
        VALUES (id_usuario_estabelecimento, 'cadastro_produto', pontos_ganhos, 
               'Pontos ganhos por cadastrar novo produto', NEW.id_produto);
        
        -- Atualizar saldo do usuário
        INSERT INTO tbl_saldo_infocash (id_usuario, saldo_total)
        VALUES (id_usuario_estabelecimento, pontos_ganhos)
        ON DUPLICATE KEY UPDATE saldo_total = saldo_total + pontos_ganhos;
    END IF;
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

-- View para dashboard InfoCash do usuário
CREATE VIEW vw_infocash_usuario AS
SELECT 
    s.id_usuario,
    u.nome as nome_usuario,
    s.saldo_total,
    s.ultima_atualizacao,
    COUNT(i.id_transacao) as total_transacoes,
    COUNT(CASE WHEN i.tipo_acao = 'avaliacao_promocao' THEN 1 END) as avaliacoes_promocao,
    COUNT(CASE WHEN i.tipo_acao = 'cadastro_produto' THEN 1 END) as cadastros_produto,
    COUNT(CASE WHEN i.tipo_acao = 'avaliacao_empresa' THEN 1 END) as avaliacoes_empresa,
    SUM(CASE WHEN i.tipo_acao = 'avaliacao_promocao' THEN i.pontos ELSE 0 END) as pontos_avaliacoes_promocao,
    SUM(CASE WHEN i.tipo_acao = 'cadastro_produto' THEN i.pontos ELSE 0 END) as pontos_cadastros_produto,
    SUM(CASE WHEN i.tipo_acao = 'avaliacao_empresa' THEN i.pontos ELSE 0 END) as pontos_avaliacoes_empresa
FROM tbl_saldo_infocash s
INNER JOIN tbl_usuario u ON s.id_usuario = u.id_usuario
LEFT JOIN tbl_infocash i ON s.id_usuario = i.id_usuario
GROUP BY s.id_usuario, u.nome, s.saldo_total, s.ultima_atualizacao;

-- Adicionar campo id_usuario na tabela de estabelecimento se não existir
-- (Necessário para o trigger de cadastro de produto funcionar)
ALTER TABLE tbl_estabelecimento 
ADD COLUMN IF NOT EXISTS id_usuario INT NULL,
ADD CONSTRAINT fk_estabelecimento_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario);

-- Inserir alguns dados de exemplo para testar
INSERT IGNORE INTO tbl_categoria (nome) VALUES 
('Alimentação'), ('Bebidas'), ('Higiene'), ('Limpeza'), ('Eletrônicos');

INSERT IGNORE INTO tbl_produto (nome, descricao, id_categoria) VALUES 
('Leite Integral 1L', 'Leite integral marca premium', 1),
('Pão de Forma', 'Pão de forma tradicional', 1),
('Refrigerante Cola 2L', 'Refrigerante sabor cola', 2),
('Sabonete Líquido', 'Sabonete líquido neutro', 3),
('Detergente Líquido', 'Detergente concentrado', 4);
