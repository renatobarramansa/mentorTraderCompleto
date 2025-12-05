import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    validate(token: string): Promise<{
        valid: boolean;
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            image: string;
        };
    }>;
}
