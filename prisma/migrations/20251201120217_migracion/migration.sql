-- AlterTable
ALTER TABLE `tbl_produto` ADD COLUMN `imagem` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `tbl_infocash` (
    `id_transacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `tipo_acao` VARCHAR(50) NOT NULL,
    `pontos` INTEGER NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `referencia_id` INTEGER NULL,
    `data_transacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_transacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_saldo_infocash` (
    `id_usuario` INTEGER NOT NULL,
    `saldo_total` INTEGER NOT NULL DEFAULT 0,
    `ultima_atualizacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tbl_saldo_infocash_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
