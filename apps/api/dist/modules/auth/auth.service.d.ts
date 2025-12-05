import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            image: string;
            createdAt: Date;
        };
        token: string;
    }>;
    private generateToken;
    validateToken(token: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        image: string;
    }>;
}
