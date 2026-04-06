import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { SaleDetail } from "./SaleDetail";

@Entity()
export class Sale {
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

    @OneToMany(() => SaleDetail, (detail) => detail.venta, { cascade: true })
    detalles: SaleDetail[];
}
