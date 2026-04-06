import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ unique: true })
    cedula: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    limite: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    deuda: number;

    @Column({ default: "activo" })
    estado: string;
}
