import "reflect-metadata"
import { DataSource } from "typeorm"
import { Cliente } from "./entity/Cliente"
import { Producto } from "./entity/Producto"
import { Venta } from "./entity/Venta"
import { VentaDetalle } from "./entity/VentaDetalle"
import { Pago } from "./entity/Pago"

export const AppDataSource = new DataSource({
    type: process.env.DB_HOST ? "mysql" : "sqlite",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "fiao_db",
    ...(process.env.DB_HOST ? {
        extra: {
            authPlugins: {
                mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
            }
        }
    } : {}),
    synchronize: false, // Evitar colisiones con init.sql
    logging: false,
    entities: [Cliente, Producto, Venta, VentaDetalle, Pago],
    migrations: [],
    subscribers: [],
})
