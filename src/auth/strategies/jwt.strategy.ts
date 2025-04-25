import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PayloadInterface } from "../payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { UsuarioEntity } from "src/usuario/entity/usuario.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET')
        });
    }

    //Metodo para validar el token y obtener el payload
    async validate(payload: PayloadInterface) {
        //Extraer nombre del usuario y email del payload
        const { usu_nombreUsuario, usu_email } = payload;

        //Buscar el usuario en la base de datos por nombre de usuario y correo electronico
        const usuario = await this.usuarioRepository.findOne({
            where: [
                { usu_nombreUsuario: usu_nombreUsuario },
                { usu_email: usu_email }
            ],
        });
        //Si el usuario no existe, lanzar una excepcion 
        if (!usuario) return new UnauthorizedException('Usuario no encontrado');

        //Si el usuario existe, retornar el usuario
        return usuario;
    }
}