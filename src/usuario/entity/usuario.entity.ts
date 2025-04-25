import { RolEntity } from "src/rol/entity/rol.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'usuario' })
export class UsuarioEntity {
    @PrimaryGeneratedColumn('increment')
    usu_id: number;

    @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
    usu_identificacion: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    usu_nombre: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    usu_apellido: string;

    @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
    usu_email: string;

    @Column({ type: 'varchar', length: 10, nullable: false, unique: true })
    usu_nombreUsuario: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    usu_password: string;

    @Column({ type: 'uuid', unique: true, nullable: true, name: 'reset_password_token' })
    resetpasswordToken: string;

    @Column({ type: 'timestamp', nullable: true }) 
    resetpasswordExpires: Date | null;

    @ManyToOne(() => RolEntity, (rol) => rol.usuarios)
    rol: RolEntity;
}