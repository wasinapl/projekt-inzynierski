import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                        register: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should return JWT token when login is successful', async () => {
            const user = { id: 1, email: 'test@example.com', role: 'USER' };
            const loginResult = { access_token: 'jwt_token' };

            jest.spyOn(authService, 'login').mockResolvedValue(loginResult);

            const result = await authController.login({ user });
            expect(result).toEqual(loginResult);
            expect(authService.login).toHaveBeenCalledWith(user);
        });
    });

    describe('register', () => {
        it('should register a new user and return JWT token', async () => {
            const registerDto: RegisterDto = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            };
            const newUser = {
                id: 1,
                name: 'New User',
                email: 'newuser@example.com',
                role: 'USER',
            };
            const loginResult = { access_token: 'jwt_token' };

            jest.spyOn(authService, 'register').mockResolvedValue(newUser);
            jest.spyOn(authService, 'login').mockResolvedValue(loginResult);

            const result = await authController.register(registerDto);
            expect(result).toEqual(loginResult);
            expect(authService.register).toHaveBeenCalledWith(
                registerDto.email,
                registerDto.password,
                registerDto.name
            );
            expect(authService.login).toHaveBeenCalledWith(newUser);
        });
    });
});
