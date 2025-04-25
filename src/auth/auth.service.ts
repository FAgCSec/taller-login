import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { LoginDto } from 'src/dtos/login.dto';
import { RolEntity } from 'src/rol/entity/rol.entity';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { UsuarioEntity } from 'src/usuario/entity/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { TokenDto } from './dto/token.dto';
import { UsuarioEmailDto } from './dto/usuario-email.dto';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>,
        @InjectRepository(RolEntity)
        private readonly rolRepository: Repository<RolEntity>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailsService,
    ) { }

    async register(userData: CreateUsuarioDto){
        //Generar un salt para mejorar la seguridad del hash de la contraseña
        const salt = await bcrypt.genSalt(10);

        //Hashea la contraseña del usuario con el salt generado
        const hashedPassword = await bcrypt.hash(userData.usu_password, salt)

        const rol = await this.rolRepository.findOne({where: {rol_id: userData.rolId}})

        if(!rol){
            throw new BadRequestException('El rol especifado no existe');
        }

        const newUser = this.usuarioRepository.create({
            ...userData,
            usu_password: hashedPassword,
            rol
        })

        await this.usuarioRepository.save(newUser)
    }

    //Metodo para autenticar al usuario y generar el token
    async login(dto: LoginDto): Promise<any> {
        const { usu_nombreUsuario } = dto;

        //Buscar el usuario en la base de datos por nombre de usuario
        const usuario = await this.usuarioRepository.findOne({
            where: [
                { usu_nombreUsuario: usu_nombreUsuario }
            ],
        });

        //Si el usuario no existe, lanzar una excepcion 
        if (!usuario) return new UnauthorizedException('Usuario no encontrado');

        //Comparar la contraseña ingresada con la contraseña almacenada en la base de datos
        const passwordOk = await compare(dto.usu_password, usuario.usu_password);

        if(!passwordOk) {
            return new UnauthorizedException('Contraseña incorrecta');
        }

        // Creando el payload para el token JWT con la informacion del usuario
        const payload = {
            usu_id: usuario.usu_id,
            usu_nombre: usuario.usu_nombre,
            usu_apellido: usuario.usu_apellido,
            usu_email: usuario.usu_email,
            usu_nombreUsuario: usuario.usu_nombreUsuario,
            usu_rol: usuario.rol.rol_nombre,
        }

        //Generar el token JWT
        const token = this.jwtService.sign(payload, { expiresIn: '1h' });

        //Retornar el token y el usuario
        return token;
    }

    //Metodo refrescar el token
    async refresh(dto: TokenDto): Promise<any> {
       
        //Decodifica el token recibido.
        const usuario = await this.jwtService.decode(dto.token)

        //Crear el payload para el nuevo token
        const payload = {
            usu_id: usuario['usu_id'],
            usu_nombre: usuario['usu_nombre'],
            usu_apellido: usuario['usu_apellido'],
            usu_email: usuario['usu_email'],
            usu_nombreUsuario: usuario['usu_nombreUsuario'],
            usu_rol: usuario['usu_rol'],
        }

        //Generar el nuevo token
        const token = this.jwtService.sign(payload);

        return token;
    }

    //Generar un codigo de reestablecimiento de contraseña (codigo de 6 digitos)
    generateResetPasswordCode(): string {
        //Generar un codigo de 6 digitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        return codigo;
    }

    //Solicitud para reestablecer la contraseña
    async requestResetPassword(usuarioDto: UsuarioEmailDto): Promise<void> {
        //Extraer el email del DTO recibido por parametro
        const {usu_email} = usuarioDto

        try {
            const usuario = await this.usuarioRepository.findOne({where: {usu_email}})

            if(!usuario) {
                throw new BadRequestException('El correo electronico no existe en la base de datos')
            }

            //Generar un codigo de reestablecimiento de contraseña
            const resetPasswordCode = this.generateResetPasswordCode();
            usuario.resetpasswordToken = resetPasswordCode;
            usuario.resetpasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de expiracion

            await this.usuarioRepository.save(usuario)

            //Enviar el correo electronico al usuario con el codigo de reestablecimiento de contraseña
            this.mailService.sendUserRequestPassword(usuario, resetPasswordCode);


            //Programar la eliminacion del codigo después de 10minutos
            setTimeout(async () => {
                usuario.resetpasswordToken = '';
                usuario.resetpasswordExpires = null;
                await this.usuarioRepository.save(usuario)
            }, 10 * 60 * 1000); // 10 minutos


        } catch (error) {
            throw new BadRequestException('Error en la solicitud:', error.message);

        }
    }


}
