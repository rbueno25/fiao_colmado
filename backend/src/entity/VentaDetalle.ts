import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Venta } from "./Venta";
import { Producto } from "./Producto";

@Entity()
export class VentaDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cantidad: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    subtotal: number;

    @ManyToOne(() => Venta, venta => venta.detalles)
    venta: Venta;

    @ManyToOne(() => Producto)
    producto: Producto;
}
