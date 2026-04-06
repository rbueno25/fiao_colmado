import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Cliente } from "./Client";

@Entity({ name: "pago" })
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "cliente_id" })
    cliente: Client;

    @Column("decimal", { precision: 10, scale: 2 })
    monto: number;

    @Column({ default: "efectivo" })
    metodo: string;

    @Column({ nullable: true, default: '' })
    nota: string;

    @CreateDateColumn()
    fecha: Date;
}
