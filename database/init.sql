CREATE DATABASE IF NOT EXISTS fiao_db;
USE fiao_db;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS venta_detalle;
DROP TABLE IF EXISTS venta;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS producto;

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    cedula VARCHAR(15) UNIQUE,
    limite DECIMAL(10,2) DEFAULT 0.00,
    deuda DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS venta_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES venta(id),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);

CREATE TABLE IF NOT EXISTS pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(50) DEFAULT 'efectivo',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Datos iniciales de prueba (Opcionales pero útiles para el MVP)
INSERT IGNORE INTO usuario (username, password_hash, rol) VALUES ('admin_colmado', 'fiao123', 'admin');
INSERT IGNORE INTO cliente (nombre, telefono, cedula, limite, deuda, estado) VALUES ('Juanito Perez', '809-555-1234', '001-0000001-1', 5000, 200, 'activo');
INSERT IGNORE INTO cliente (nombre, telefono, cedula, limite, deuda, estado) VALUES ('Maria Rodriguez', '829-111-2222', '402-1234567-8', 3000, 3000, 'bloqueado');
INSERT IGNORE INTO cliente (nombre, telefono, cedula, limite, deuda, estado) VALUES ('Primo Compadre', '809-219-3302', '001-9312809-2', 10000, 1500, 'activo');
INSERT IGNORE INTO cliente (nombre, telefono, cedula, limite, deuda, estado) VALUES ('Dona Rosa', '849-000-1111', '001-1111111-1', 2000, 500, 'activo');
INSERT IGNORE INTO cliente (nombre, telefono, cedula, limite, deuda, estado) VALUES ('Manuel El Mecanico', '809-999-8888', '001-2222222-2', 1000, 1000, 'bloqueado');
