import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Cliente } from "./Cliente";

@Entity()
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    monto: number;

    @Column({ nullable: true })
    nota: string;

    @ManyToOne(() => Cliente)
    cliente: Cliente;
}
