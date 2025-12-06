import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // ========== REGISTER ==========
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new UnauthorizedException("Usuário já existe");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    // Remover senha do retorno
    const { password: _, ...result } = user;
    
    // Gerar token JWT
    const token = this.generateToken(result);

    return {
      user: result,
      token
    };
  }

  // ========== LOGIN ==========
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    // Gerar token
    const token = this.generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token
    };
  }

  // ========== GET PROFILE ==========
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    return user;
  }

  // ========== GERAR TOKEN JWT ==========
  private generateToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      name: user.name 
    };

    return this.jwtService.sign(payload);
  }
}
