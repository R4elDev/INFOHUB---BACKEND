-- =============================================
-- SCRIPT PARA CRIAR TABELAS INFOCASH
-- Execute este script no MySQL Workbench
-- =============================================

USE db_infohub;

-- 1. Criar tabela de transações InfoCash
CREATE TABLE IF NOT EXISTS tbl_infocash (
    id_transacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_acao VARCHAR(50) NOT NULL,
    pontos INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referencia_id INT NULL,
    INDEX idx_infocash_usuario (id_usuario),
    INDEX idx_infocash_tipo (tipo_acao),
    INDEX idx_infocash_data (data_transacao),
    CONSTRAINT fk_infocash_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario) ON DELETE CASCADE
);

-- 2. Criar tabela de saldo InfoCash
CREATE TABLE IF NOT EXISTS tbl_saldo_infocash (
    id_usuario INT PRIMARY KEY,
    saldo_total INT DEFAULT 0,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saldo_usuario FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id_usuario) ON DELETE CASCADE
);

-- 3. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' AS status;

SHOW TABLES LIKE 'tbl_infocash';
SHOW TABLES LIKE 'tbl_saldo_infocash';

-- 4. Inserir saldo inicial para usuarios existentes (opcional)
INSERT IGNORE INTO tbl_saldo_infocash (id_usuario, saldo_total)
SELECT id_usuario, 0 FROM tbl_usuario;

SELECT 'Script executado com sucesso!' AS resultado;
