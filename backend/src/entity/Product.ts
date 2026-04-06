import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "producto" })
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column("decimal", { precision: 10, scale: 2 })
    precio: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ nullable: true, default: 'General' })
    categoria: string;

    @CreateDateColumn()
    created_at: Date;
}
