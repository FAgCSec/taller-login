import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { UsuarioEmailDto } from './dto/usuario-email.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post('register')
    async register(@Body() user: CreateUsuarioDto){
        return this.authService.register(user)
    }

    //Solicitud Reestablecer contraseña
    @Post('request-password')
    requestPassword(@Body() user: UsuarioEmailDto) {
        return this.authService.requestResetPassword(user)
    }
}
