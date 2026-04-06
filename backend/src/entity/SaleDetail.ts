import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Sale } from "./Sale";
import { Product } from "./Product";

@Entity()
export class SaleDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Sale, (sale) => sale.detalles)
    @JoinColumn({ name: "venta_id" })
    venta: Sale;

    @ManyToOne(() => Product)
    @JoinColumn({ name: "producto_id" })
    producto: Product;

    @Column()
    cantidad: number;

    @Column("decimal", { precision: 10, scale: 2 })
    subtotal: number;
}
