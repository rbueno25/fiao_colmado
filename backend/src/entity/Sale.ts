import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { VentaDetalle } from "./SaleDetail";

@Entity({ name: "venta" })
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client, { nullable: true })
    @JoinColumn({ name: "cliente_id" })
    cliente: Client;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    montoTotal: number;

    @Column({ default: "contado" })
    tipo: string; // 'contado' or 'credito'

    @CreateDateColumn()
    fecha: Date;

    @OneToMany(() => VentaDetalle, (detail) => detail.venta, { cascade: true })
    detalles: VentaDetalle[];
}
