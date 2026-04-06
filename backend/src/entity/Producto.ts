import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    precio: number;

    @Column({ type: "int", default: 0 })
    stock: number;

    @Column({ nullable: true })
    categoria: string;

    @Column({ nullable: true })
    imagen_url: string;
}
