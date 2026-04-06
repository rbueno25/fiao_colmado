import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Venta } from "./Sale";
import { Producto } from "./Product";

@Entity({ name: "venta_detalle" })
export class VentaDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Venta, (venta) => venta.detalles)
    @JoinColumn({ name: "venta_id" })
    venta: Venta;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: "producto_id" })
    producto: Producto;

    @Column()
    cantidad: number;

    @Column("decimal", { precision: 10, scale: 2 })
    subtotal: number;
}
