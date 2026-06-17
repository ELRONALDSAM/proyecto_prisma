CREATE DATABASE Prisma;
GO

USE Prisma;
GO

CREATE TABLE usuarios (
    id INT PRIMARY KEY IDENTITY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT GETDATE()
);

CREATE TABLE categorias (
    id INT PRIMARY KEY IDENTITY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE productos (
    id INT PRIMARY KEY IDENTITY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    categoria_id INT,
    stock INT DEFAULT 0,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE carrito (
    id INT PRIMARY KEY IDENTITY,
    usuario_id INT,
    producto_id INT,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE pedidos (
    id INT PRIMARY KEY IDENTITY,
    usuario_id INT,
    total DECIMAL(10,2),
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_pedido (
    id INT PRIMARY KEY IDENTITY,
    pedido_id INT,
    producto_id INT,
    cantidad INT,
    precio DECIMAL(10,2),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE wishlist (
    id INT PRIMARY KEY IDENTITY,
    usuario_id INT,
    producto_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

INSERT INTO categorias (nombre)
VALUES ('Hombre'), ('Mujer'), ('Niño'), ('Accesorios');

INSERT INTO usuarios (nombre, apellido, email, password)
VALUES 
('Admin', 'Sistema', 'admin@prisma.com', '12345678'),
('Maria', 'Lopez', 'maria@correo.com', 'maria1234');

INSERT INTO productos (nombre, precio, descripcion, categoria_id, stock)
VALUES
('Vestido de Gala', 3679.15, 'Vestido elegante', 2, 10),
('Traje Lino', 8800.00, 'Traje formal', 1, 5),
('Conjunto Niño', 3200.00, 'Ropa niño', 3, 8),
('Falda Elegante', 2800.00, 'Falda plisada', 2, 12);