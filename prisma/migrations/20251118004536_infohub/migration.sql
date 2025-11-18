-- CreateTable
CREATE TABLE `tbl_usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `perfil` ENUM('consumidor', 'admin', 'estabelecimento') NOT NULL DEFAULT 'consumidor',
    `cpf` VARCHAR(14) NULL,
    `cnpj` VARCHAR(18) NULL,
    `telefone` VARCHAR(20) NULL,
    `data_nascimento` DATE NULL,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tbl_usuario_email_key`(`email`),
    UNIQUE INDEX `tbl_usuario_cpf_key`(`cpf`),
    UNIQUE INDEX `tbl_usuario_cnpj_key`(`cnpj`),
    UNIQUE INDEX `tbl_usuario_telefone_key`(`telefone`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_enderecoUsuario` (
    `id_endereco` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `cep` VARCHAR(9) NOT NULL,
    `logradouro` VARCHAR(100) NULL,
    `numero` VARCHAR(10) NULL,
    `complemento` VARCHAR(50) NULL,
    `bairro` VARCHAR(60) NULL,
    `cidade` VARCHAR(60) NULL,
    `estado` CHAR(2) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,

    PRIMARY KEY (`id_endereco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_estabelecimento` (
    `id_estabelecimento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `data_cadastro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tbl_estabelecimento_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id_estabelecimento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_enderecoEstabelecimento` (
    `id_endereco` INTEGER NOT NULL AUTO_INCREMENT,
    `id_estabelecimento` INTEGER NOT NULL,
    `cep` VARCHAR(9) NOT NULL,
    `logradouro` VARCHAR(100) NULL,
    `numero` VARCHAR(10) NULL,
    `complemento` VARCHAR(50) NULL,
    `bairro` VARCHAR(60) NULL,
    `cidade` VARCHAR(60) NULL,
    `estado` CHAR(2) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,

    PRIMARY KEY (`id_endereco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_categoria` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_produto` (
    `id_produto` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `descricao` TEXT NULL,
    `id_categoria` INTEGER NULL,

    PRIMARY KEY (`id_produto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_precoProduto` (
    `id_preco` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produto` INTEGER NOT NULL,
    `id_estabelecimento` INTEGER NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `data_registro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_preco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_promocao` (
    `id_promocao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produto` INTEGER NOT NULL,
    `id_estabelecimento` INTEGER NOT NULL,
    `preco_promocional` DECIMAL(10, 2) NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,

    PRIMARY KEY (`id_promocao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_post` (
    `id_post` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NULL,
    `conteudo` TEXT NULL,
    `imagem` VARCHAR(255) NULL,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_post`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_comentario` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_post` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `conteudo` TEXT NOT NULL,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_curtida` (
    `id_curtida` INTEGER NOT NULL AUTO_INCREMENT,
    `id_post` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `data_curtida` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_curtida`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_compartilhamento` (
    `id_compartilhamento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_post` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `data_compartilhamento` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_compartilhamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_favorito` (
    `id_favorito` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `data_adicionado` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_favorito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_notificacao` (
    `id_notificacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `mensagem` VARCHAR(255) NOT NULL,
    `tipo` ENUM('promocao', 'alerta', 'social', 'compra', 'carrinho') NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `data_envio` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_notificacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_recomendacao` (
    `id_recomendacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_recomendacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_listaCompra` (
    `id_lista` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome_lista` VARCHAR(100) NULL,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_lista`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_itemLista` (
    `id_item` INTEGER NOT NULL AUTO_INCREMENT,
    `id_lista` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_recuperacaoSenha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `codigo` VARCHAR(6) NOT NULL,
    `expiracao` TIMESTAMP(0) NOT NULL,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_carrinho` (
    `id_carrinho` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `data_adicionado` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_carrinho`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_compra` (
    `id_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_estabelecimento` INTEGER NOT NULL,
    `valor_total` DECIMAL(10, 2) NOT NULL,
    `status_compra` ENUM('pendente', 'confirmada', 'processando', 'enviada', 'entregue', 'cancelada') NOT NULL DEFAULT 'pendente',
    `metodo_pagamento` VARCHAR(50) NULL,
    `data_compra` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_entrega` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_itemCompra` (
    `id_item_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `id_compra` INTEGER NOT NULL,
    `id_produto` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_item_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_avaliacao` (
    `id_avaliacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_produto` INTEGER NULL,
    `id_estabelecimento` INTEGER NULL,
    `nota` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `data_avaliacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_avaliacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_enderecoUsuario` ADD CONSTRAINT `tbl_enderecoUsuario_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_estabelecimento` ADD CONSTRAINT `tbl_estabelecimento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_enderecoEstabelecimento` ADD CONSTRAINT `tbl_enderecoEstabelecimento_id_estabelecimento_fkey` FOREIGN KEY (`id_estabelecimento`) REFERENCES `tbl_estabelecimento`(`id_estabelecimento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_produto` ADD CONSTRAINT `tbl_produto_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `tbl_categoria`(`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_precoProduto` ADD CONSTRAINT `tbl_precoProduto_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_precoProduto` ADD CONSTRAINT `tbl_precoProduto_id_estabelecimento_fkey` FOREIGN KEY (`id_estabelecimento`) REFERENCES `tbl_estabelecimento`(`id_estabelecimento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_promocao` ADD CONSTRAINT `tbl_promocao_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_promocao` ADD CONSTRAINT `tbl_promocao_id_estabelecimento_fkey` FOREIGN KEY (`id_estabelecimento`) REFERENCES `tbl_estabelecimento`(`id_estabelecimento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_post` ADD CONSTRAINT `tbl_post_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_comentario` ADD CONSTRAINT `tbl_comentario_id_post_fkey` FOREIGN KEY (`id_post`) REFERENCES `tbl_post`(`id_post`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_comentario` ADD CONSTRAINT `tbl_comentario_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_curtida` ADD CONSTRAINT `tbl_curtida_id_post_fkey` FOREIGN KEY (`id_post`) REFERENCES `tbl_post`(`id_post`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_curtida` ADD CONSTRAINT `tbl_curtida_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_compartilhamento` ADD CONSTRAINT `tbl_compartilhamento_id_post_fkey` FOREIGN KEY (`id_post`) REFERENCES `tbl_post`(`id_post`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_compartilhamento` ADD CONSTRAINT `tbl_compartilhamento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_favorito` ADD CONSTRAINT `tbl_favorito_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_favorito` ADD CONSTRAINT `tbl_favorito_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_notificacao` ADD CONSTRAINT `tbl_notificacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_recomendacao` ADD CONSTRAINT `tbl_recomendacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_recomendacao` ADD CONSTRAINT `tbl_recomendacao_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_listaCompra` ADD CONSTRAINT `tbl_listaCompra_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_itemLista` ADD CONSTRAINT `tbl_itemLista_id_lista_fkey` FOREIGN KEY (`id_lista`) REFERENCES `tbl_listaCompra`(`id_lista`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_itemLista` ADD CONSTRAINT `tbl_itemLista_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_recuperacaoSenha` ADD CONSTRAINT `tbl_recuperacaoSenha_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_carrinho` ADD CONSTRAINT `tbl_carrinho_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_carrinho` ADD CONSTRAINT `tbl_carrinho_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_compra` ADD CONSTRAINT `tbl_compra_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_compra` ADD CONSTRAINT `tbl_compra_id_estabelecimento_fkey` FOREIGN KEY (`id_estabelecimento`) REFERENCES `tbl_estabelecimento`(`id_estabelecimento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_itemCompra` ADD CONSTRAINT `tbl_itemCompra_id_compra_fkey` FOREIGN KEY (`id_compra`) REFERENCES `tbl_compra`(`id_compra`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_itemCompra` ADD CONSTRAINT `tbl_itemCompra_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_avaliacao` ADD CONSTRAINT `tbl_avaliacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `tbl_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_avaliacao` ADD CONSTRAINT `tbl_avaliacao_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `tbl_produto`(`id_produto`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_avaliacao` ADD CONSTRAINT `tbl_avaliacao_id_estabelecimento_fkey` FOREIGN KEY (`id_estabelecimento`) REFERENCES `tbl_estabelecimento`(`id_estabelecimento`) ON DELETE SET NULL ON UPDATE CASCADE;
