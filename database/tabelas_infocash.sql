-- =============================================
-- TABELAS INFOCASH - SISTEMA DE PONTOS
-- Execute este script no banco de dados
-- =============================================

-- Tabela de transações de pontos
CREATE TABLE IF NOT EXISTS `tbl_infocash` (
    `id_transacao` INT NOT NULL AUTO_INCREMENT,
    `id_usuario` INT NOT NULL,
    `tipo_acao` VARCHAR(50) NOT NULL,
    `pontos` INT NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `referencia_id` INT NULL,
    `data_transacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_transacao`),
    INDEX `idx_infocash_usuario` (`id_usuario`),
    INDEX `idx_infocash_tipo` (`tipo_acao`),
    INDEX `idx_infocash_data` (`data_transacao`),
    CONSTRAINT `fk_infocash_usuario` FOREIGN KEY (`id_usuario`) 
        REFERENCES `tbl_usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de saldo de pontos (cache para consultas rápidas)
CREATE TABLE IF NOT EXISTS `tbl_saldo_infocash` (
    `id_saldo` INT NOT NULL AUTO_INCREMENT,
    `id_usuario` INT NOT NULL UNIQUE,
    `saldo_total` INT NOT NULL DEFAULT 0,
    `ultima_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_saldo`),
    INDEX `idx_saldo_usuario` (`id_usuario`),
    INDEX `idx_saldo_total` (`saldo_total` DESC),
    CONSTRAINT `fk_saldo_usuario` FOREIGN KEY (`id_usuario`) 
        REFERENCES `tbl_usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PONTOS POR AÇÃO (referência)
-- =============================================
-- criar_post: 10 pontos
-- comentar: 5 pontos
-- curtir: 2 pontos
-- compartilhar: 3 pontos
-- avaliar_produto: 8 pontos
-- avaliar_estabelecimento: 8 pontos
-- primeira_compra: 50 pontos
-- compra: 15 pontos
-- indicar_amigo: 20 pontos
-- completar_perfil: 25 pontos
