create database db_infohub;
use db_infohub;

show tables;

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('consumidor','admin','estabelecimento') DEFAULT 'consumidor',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EnderecoUsuario (
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
    CONSTRAINT fk_usuario_endereco FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Estabelecimento (
    id_estabelecimento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EnderecoEstabelecimento (
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
    CONSTRAINT fk_estab_endereco FOREIGN KEY (id_estabelecimento) REFERENCES Estabelecimento(id_estabelecimento)
);

CREATE TABLE Categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE Produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    id_categoria INT,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

CREATE TABLE PrecoProduto (
    id_preco INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_preco_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    CONSTRAINT fk_preco_estab FOREIGN KEY (id_estabelecimento) REFERENCES Estabelecimento(id_estabelecimento)
);

CREATE TABLE Promocao (
    id_promocao INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    preco_promocional DECIMAL(10,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    CONSTRAINT fk_promocao_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    CONSTRAINT fk_promocao_estab FOREIGN KEY (id_estabelecimento) REFERENCES Estabelecimento(id_estabelecimento)
);

CREATE TABLE Post (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150),
    conteudo TEXT,
    imagem VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coment_post FOREIGN KEY (id_post) REFERENCES Post(id_post),
    CONSTRAINT fk_coment_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Curtida (
    id_curtida INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_like_post FOREIGN KEY (id_post) REFERENCES Post(id_post),
    CONSTRAINT fk_like_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Compartilhamento (
    id_compartilhamento INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_usuario INT NOT NULL,
    data_compartilhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_share_post FOREIGN KEY (id_post) REFERENCES Post(id_post),
    CONSTRAINT fk_share_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Favorito (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_fav_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);

CREATE TABLE Notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensagem VARCHAR(255) NOT NULL,
    tipo ENUM('promocao','alerta','social'),
    lida BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Recomendacao (
    id_recomendacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    motivo VARCHAR(255),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recom_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_recom_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);

CREATE TABLE ListaCompra (
    id_lista INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome_lista VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lista_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE ItemLista (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_lista INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT DEFAULT 1,
    CONSTRAINT fk_item_lista FOREIGN KEY (id_lista) REFERENCES ListaCompra(id_lista),
    CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);
