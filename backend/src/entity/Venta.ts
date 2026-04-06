import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cliente } from "./Cliente";
import { VentaDetalle } from "./VentaDetalle";

@Entity()
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    montoTotal: number;

    @Column()
    tipo: string; // 'contado' o 'credito'

    @ManyToOne(() => Cliente, { nullable: true })
    cliente: Cliente;

    @OneToMany(() => VentaDetalle, detalle => detalle.venta, { cascade: true })
    detalles: VentaDetalle[];
}
