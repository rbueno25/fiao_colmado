import "reflect-metadata"
import { DataSource } from "typeorm"
import { Client } from "./entity/Client"

export const AppDataSource = new DataSource({
    type: process.env.DB_HOST ? "mysql" : "sqlite",
    database: process.env.DB_HOST ? (process.env.DB_NAME || "fiao_db") : "fiao_database.sqlite",
    ...(process.env.DB_HOST ? {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    } : {}),
    synchronize: false,
    logging: false,
    entities: [Client],
    migrations: [],
    subscribers: [],
})
