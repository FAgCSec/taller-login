import { IsNotEmpty, MaxLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @MaxLength(10, {message: 'El campo nombre de usuario no puede tener más de 10 caracteres'})
    usu_nombreUsuario: string;
    
    @IsNotEmpty()
    usu_password: string;
}