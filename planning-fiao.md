# 🧾 Proyecto: Sistema de Control de Crédito "Fiao"

## 🎯 Objetivo General
Desarrollar un sistema que permita a los colmados gestionar el crédito ("fiao") de sus clientes de manera eficiente, controlando deudas, pagos y riesgos.

---

# 🧩 FASE 1: Análisis y Planificación

## 📌 Tareas
- [ ] Definir problema claramente
- [ ] Identificar actores (colmadero, cliente)
- [ ] Definir alcance del sistema
- [ ] Identificar riesgos del proyecto
- [ ] Definir objetivos generales y específicos

---

# 🧩 FASE 2: Diseño del Sistema

## 📌 Requerimientos
- [ ] Requerimientos funcionales
- [ ] Requerimientos no funcionales
- [ ] Definir criterios de aceptación

## 📌 Reglas de negocio
- [ ] Definir límite de crédito por cliente
- [ ] Bloqueo automático si excede límite
- [ ] Registro obligatorio de pagos
- [ ] Cálculo de deuda acumulada

---

# 🧩 FASE 3: Modelado

## 📌 Modelo de datos
- [x] Cliente
- [x] Usuario
- [x] Venta
- [x] Pago
- [x] Producto

### 💾 Lógica de Base de Datos Estructurada (Esquema principal)
*A consultar para futuras implementaciones de funciones:*
* `cliente`: **id** (PK), nombre, telefono, cedula, limite, deuda, estado, createdAt, updatedAt
* `usuario`: **id** (PK), username, password_hash, rol (admin/empleado), createdAt
* `producto`: **id** (PK), nombre, precio, stock, createdAt
* `venta`: **id** (PK), cliente_id (FK), usuario_id (FK), monto_total, fecha
* `venta_detalle`: **id** (PK), venta_id (FK), producto_id (FK), cantidad, subtotal
* `pago`: **id** (PK), cliente_id (FK), monto, metodo, fecha

## 📌 Diagramas
- [ ] Diagrama de flujo (mínimo 6)
- [ ] Casos de uso (mínimo 8)

---

# 🧩 FASE 4: Algoritmos

## 📌 Implementar lógica
- [ ] Validación de límite de crédito
- [ ] Cálculo de deuda acumulada
- [ ] Ordenamiento por deuda
- [ ] Registro de pagos
- [ ] Bloqueo de cliente
- [ ] Validación de inputs
- [ ] Manejo de errores
- [ ] Generación de reportes

## 📌 Pseudocódigo (mínimo 8)
- [ ] Registrar cliente
- [ ] Registrar venta
- [ ] Validar crédito
- [ ] Registrar pago
- [ ] Calcular deuda
- [ ] Generar reporte
- [ ] Login
- [ ] Manejo de errores

---

# 🧩 FASE 5: Desarrollo del MVP

## 📌 Backend / Frontend (MVP Integrado)
- [ ] Construir con React, Vite y TypeScript
- [ ] CRUD de clientes (listo en UI MVP)
- [x] CRUD de ventas (diseño listo y prototipado)
- [ ] CRUD de pagos (diseño planificado)
- [ ] Implementar lógica de crédito

## 📌 Frontend
- [ ] Pantalla de login
- [ ] Dashboard
- [ ] Registro de clientes
- [ ] Registro de ventas
- [ ] Historial de pagos
- [ ] Reportes

## 📌 Seguridad
- [ ] Autenticación (login)
- [ ] Autorización (roles)
- [ ] Validación de datos

---

# 🧩 FASE 6: UX/UI

## 📌 Diseño
- [ ] Wireframes
- [ ] Prototipo visual
- [ ] Flujo de navegación

---

# 🧩 FASE 7: Manejo de Errores

## 📌 Casos
- [ ] Inputs inválidos
- [ ] Cliente bloqueado
- [ ] Sin stock
- [ ] Usuario sin permisos
- [ ] Error de servidor

---

# 🧩 FASE 8: Reportes

- [ ] Clientes morosos
- [ ] Historial de pagos
- [ ] Deuda total por cliente

---

# 🧩 FASE 9: Dockerización

- [ ] Crear Dockerfile backend
- [ ] Crear Dockerfile frontend
- [ ] Crear docker-compose
- [ ] Configurar base de datos

---

# 🧩 FASE 10: Documentación

- [ ] Contexto
- [ ] Objetivos
- [ ] Alcance funcional
- [ ] Requerimientos
- [ ] Diagramas
- [ ] Pseudocódigos
- [ ] Seguridad
- [ ] Flujos principales y alternos
- [ ] Manejo de errores
- [ ] Roadmap
- [ ] Plan de desarrollo

---

# 🧩 FASE 11: Presentación

- [ ] Problema
- [ ] Solución
- [ ] Actores
- [ ] Alcance
- [ ] Demo plan