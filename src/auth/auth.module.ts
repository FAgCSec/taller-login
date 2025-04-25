import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from 'src/usuario/entity/usuario.entity';
import { RolEntity } from 'src/rol/entity/rol.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailsService } from 'src/mails/mails.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity, RolEntity]),
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30m' }
      })
    }),
  ],
  providers: [AuthService, JwtStrategy, MailsService],
  controllers: [AuthController]
})
export class AuthModule { }
