import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthModule', () => {
  let authService: AuthService;
  let authController: AuthController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('AuthService', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    describe('validateUser', () => {
      it('should return user object when credentials are valid', async () => {
        const user = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'USER' as const, // Assuming 'USER' is one of the valid Role types
        };
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

        const result = await authService.validateUser(
          'test@example.com',
          'password123',
        );
        expect(result).toEqual({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
        });
      });

      it('should return null when user is not found', async () => {
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        const result = await authService.validateUser(
          'test@example.com',
          'password123',
        );
        expect(result).toBeNull();
      });

      it('should return null when password is invalid', async () => {
        const user = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'USER' as const,
        };
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

        const result = await authService.validateUser(
          'test@example.com',
          'wrongpassword',
        );
        expect(result).toBeNull();
      });
    });

    describe('register', () => {
      it('should create a new user and return user object without password', async () => {
        const newUser = {
          id: 1,
          name: 'New User',
          email: 'newuser@example.com',
          password: 'hashedpassword',
          role: 'USER' as const,
        };
        jest.spyOn(prismaService.user, 'create').mockResolvedValue(newUser);

        const result = await authService.register(
          'newuser@example.com',
          'password123',
        );
        expect(result).toEqual({
          id: 1,
          name: 'New User',
          email: 'newuser@example.com',
          role: 'USER',
        });
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: {
            email: 'newuser@example.com',
            password: expect.any(String),
            role: 'USER',
            name: expect.any(String),
          },
        });
      });
    });

    describe('AuthController', () => {
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
          const registerDto = {
            email: 'newuser@example.com',
            password: 'password123',
          };
          const newUser = {
            id: 1,
            name: 'New User',
            email: 'newuser@example.com',
            role: 'USER' as const,
          };
          const loginResult = { access_token: 'jwt_token' };

          jest.spyOn(authService, 'register').mockResolvedValue(newUser);
          jest.spyOn(authService, 'login').mockResolvedValue(loginResult);

          const result = await authController.register(registerDto);
          expect(result).toEqual(loginResult);
          expect(authService.register).toHaveBeenCalledWith(
            registerDto.email,
            registerDto.password,
          );
          expect(authService.login).toHaveBeenCalledWith(newUser);
        });
      });
    });
  });
});
