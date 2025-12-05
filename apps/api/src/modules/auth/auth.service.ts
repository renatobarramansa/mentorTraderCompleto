import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  // REGISTRO DE NOVO USUÁRIO
  async register(registerDto: RegisterDto) {
    // Verifica se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    
    if (existingUser) {
      throw new UnauthorizedException('Email já cadastrado');
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Cria usuário
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    // Gera token JWT
    const token = await this.generateToken(user.id);
    
    return {
      user,
      token,
    };
  }
  
  // LOGIN
  async login(loginDto: LoginDto) {
    // Busca usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    // Verifica senha
    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    // Gera token JWT
    const token = await this.generateToken(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
      },
      token,
    };
  }
  
  // GERAR TOKEN JWT
  private async generateToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d', // Token válido por 7 dias
    });
  }
  
  // VALIDAR TOKEN (para verificação)
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      
      return await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });
    } catch (error) {
      return null;
    }
  }
}
