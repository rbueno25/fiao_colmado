import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";

@Entity()
export class Payment {
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
