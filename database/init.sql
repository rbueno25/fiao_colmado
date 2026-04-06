CREATE DATABASE IF NOT EXISTS fiao_db;
USE fiao_db;

SET NAMES utf8mb4;

-- Bloquear chequeo de llaves foráneas para poder limpiar todo
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas si existen (incluyendo posibles nombres generados por ORM)
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS venta_detalle;
DROP TABLE IF EXISTS sale_detail;
DROP TABLE IF EXISTS venta;
DROP TABLE IF EXISTS sale;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS product;

-- Habilitar chequeo de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Crear tablas (Usando nombres en español para consistencia con el código existente, con camelCase donde TypeORM lo espera)
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
    cedula VARCHAR(20) UNIQUE,
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
    categoria VARCHAR(50),
    imagen_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clienteId INT,
    montoTotal DECIMAL(10,2) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'contado',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clienteId) REFERENCES cliente(id)
);

CREATE TABLE IF NOT EXISTS venta_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ventaId INT NOT NULL,
    productoId INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ventaId) REFERENCES venta(id),
    FOREIGN KEY (productoId) REFERENCES producto(id)
);

CREATE TABLE IF NOT EXISTS pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clienteId INT,
    monto DECIMAL(10,2) NOT NULL,
    nota VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clienteId) REFERENCES cliente(id)
);

-- Datos de Prueba

-- Usuarios
INSERT IGNORE INTO usuario (id, username, password_hash, rol) VALUES 
(1, 'admin_colmado', 'fiao123', 'admin'),
(2, 'jose_empleado', 'jose456', 'empleado'),
(3, 'ana_cajera', 'ana789', 'empleado');

-- Clientes (15 registros)
INSERT IGNORE INTO cliente (id, nombre, telefono, cedula, limite, deuda, estado) VALUES 
(1, 'Juanito Perez', '809-555-1234', '001-0000001-1', 5000.00, 450.00, 'activo'),
(2, 'Maria Rodriguez', '829-111-2222', '402-1234567-8', 3000.00, 3000.00, 'bloqueado'),
(3, 'Primo Compadre', '809-219-3302', '001-9312809-2', 10000.00, 1500.00, 'activo'),
(4, 'Dona Rosa', '849-000-1111', '001-1111111-1', 2000.00, 800.00, 'activo'),
(5, 'Manuel El Mecanico', '809-999-8888', '001-2222222-2', 1500.00, 1500.00, 'bloqueado'),
(6, 'Carmen la de la Esquina', '809-444-5555', '001-3333333-3', 4000.00, 0.00, 'activo'),
(7, 'Don Pedro Barber', '829-666-7777', '001-4444444-4', 6000.00, 1200.00, 'activo'),
(8, 'Lucia Modista', '849-888-9999', '001-5555555-5', 2500.00, 200.00, 'activo'),
(9, 'Roberto Taxista', '809-222-3333', '001-6666666-6', 5000.00, 4800.00, 'activo'),
(10, 'Sra. Martha', '829-777-8888', '001-7777777-7', 3500.00, 150.00, 'activo'),
(11, 'Julio Pintor', '849-123-4567', '001-8888888-8', 2000.00, 1950.00, 'activo'),
(12, 'Elena Estudiante', '809-765-4321', '402-8888888-8', 1000.00, 950.00, 'activo'),
(13, 'Francisco Delivery', '829-555-4444', '001-9999999-9', 3000.00, 100.00, 'activo'),
(14, 'Ramona la de los Dulces', '849-333-2222', '001-0101010-1', 1500.00, 0.00, 'activo'),
(15, 'Tuto Reparaciones', '809-111-0000', '001-2020202-2', 8000.00, 5600.00, 'activo');

-- Productos
INSERT IGNORE INTO producto (id, nombre, precio, stock, categoria) VALUES 
(1, 'Arroz Selecto (lb)', 35.00, 100, 'Alimentos'),
(2, 'Habichuelas Rojas (lb)', 75.00, 50, 'Alimentos'),
(3, 'Aceite de Cocina (litro)', 180.00, 30, 'Despensa'),
(4, 'Salami Super Especial', 250.00, 20, 'Embutidos'),
(5, 'Carton de Huevos (30 ud)', 210.00, 15, 'Lacteos'),
(6, 'Leche Rica (litro)', 85.00, 40, 'Lacteos'),
(7, 'Pan de Agua (unidad)', 5.00, 200, 'Panaderia'),
(8, 'Queso Geo (lb)', 320.00, 10, 'Lacteos'),
(9, 'Cafe Santo Domingo (paquete)', 125.00, 25, 'Despensa'),
(10, 'Azucar Blanca (lb)', 45.00, 80, 'Despensa');

-- Ventas
INSERT IGNORE INTO venta (id, clienteId, montoTotal, tipo, fecha) VALUES 
(1, 1, 450.00, 'credito', '2026-04-01 10:00:00'),
(2, 3, 1500.00, 'credito', '2026-04-01 11:30:00'),
(3, 4, 800.00, 'contado', '2026-04-02 09:15:00'),
(4, 7, 1200.00, 'contado', '2026-04-02 18:45:00'),
(5, 9, 4800.00, 'credito', '2026-04-03 14:20:00');

-- Detalle de Ventas
INSERT IGNORE INTO venta_detalle (ventaId, productoId, cantidad, subtotal) VALUES 
(1, 1, 5, 175.00),
(1, 2, 2, 150.00),
(1, 6, 1, 85.00),
(1, 7, 8, 40.00),
(2, 4, 2, 500.00),
(2, 5, 2, 420.00),
(2, 8, 1, 320.00),
(2, 9, 2, 250.00),
(3, 3, 2, 360.00),
(3, 10, 4, 180.00),
(3, 1, 2, 70.00),
(3, 6, 2, 170.00),
(4, 4, 3, 750.00),
(4, 5, 1, 210.00),
(4, 9, 1, 125.00),
(4, 1, 3, 105.00),
(5, 4, 10, 2500.00),
(5, 3, 5, 900.00),
(5, 8, 3, 960.00),
(5, 9, 3, 375.00);

-- Pagos
INSERT IGNORE INTO pago (clienteId, monto, nota, fecha) VALUES 
(3, 300.00, 'Abono semanal', '2026-04-03 10:00:00'),
(8, 100.00, 'Pago adelantado', '2026-04-04 11:00:00'),
(15, 2000.00, 'Abono quincena', '2026-04-04 15:30:00');
