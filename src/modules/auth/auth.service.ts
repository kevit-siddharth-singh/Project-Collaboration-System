import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../common/constants/auth.constants';
import { CONFIG_KEYS } from '../../common/constants/config.constants';
import { sanitizeUser } from '../../common/utils/sanitize-user.util';
import type { User, UserDocument } from '../users/Schemas/user.schema';
import { UserRepository } from '../users/repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = await this.userRepository.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email is already registered');

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: sanitizeUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await this.comparePassword(
      dto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: sanitizeUser(user), tokens };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const user = await this.userRepository.findByIdWithRefreshToken(userId);
    if (!user?.hashedRefreshToken)
      throw new UnauthorizedException('Access denied');

    const tokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!tokenMatch) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { $unset: { hashedRefreshToken: 1 } },
    );
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(CONFIG_KEYS.JWT_ACCESS_SECRET),
        expiresIn: this.configService.get(
          CONFIG_KEYS.JWT_ACCESS_EXPIRES_IN,
        ) as number,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(CONFIG_KEYS.JWT_REFRESH_SECRET),
        expiresIn: this.configService.get(
          CONFIG_KEYS.JWT_REFRESH_EXPIRES_IN,
        ) as number,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { hashedRefreshToken: hashed },
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private async comparePassword(
    plain: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
