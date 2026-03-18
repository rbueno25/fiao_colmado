import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm"

@Entity("cliente")
export class Client {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    nombre: string

    @Column({ length: 20 })
    telefono: string

    @Column({ length: 20, unique: true })
    cedula: string

    @Column("decimal", { precision: 10, scale: 2, default: 0.00 })
    limite: number

    @Column("decimal", { precision: 10, scale: 2, default: 0.00 })
    deuda: number

    @Column({ length: 20, default: "activo" }) 
    estado: string

    @BeforeInsert()
    @BeforeUpdate()
    updateStatus() {
        if (Number(this.deuda) >= Number(this.limite) && Number(this.limite) > 0) {
            this.estado = "bloqueado";
        } else {
            this.estado = "activo";
        }
    }


    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date
}
