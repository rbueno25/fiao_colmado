import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ name: 'password_hash' })
    password: string;

    @Column({ default: 'admin' })
    rol: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
