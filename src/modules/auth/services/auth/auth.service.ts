import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { UserRepository } from '../../../users/repositories/user.repository';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';
import { CONFIG_KEYS } from '../../../../common/constants/config.constants';
import { UserDocument } from '../../../../database/schemas/user.schema';

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
  ): Promise<{ user: Partial<UserDocument>; tokens: AuthTokens }> {
    const existing = await this.userRepository.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email is already registered');

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), tokens };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: Partial<UserDocument>; tokens: AuthTokens }> {
    const user = await this.userRepository.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await this.comparePassword(
      dto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), tokens };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const user = await this.userRepository.findById(userId);
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
    await this.userRepository.update(
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
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(
      { _id: userId },
      { hashedRefreshToken: hashed },
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(
    plain: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  private sanitizeUser(user: UserDocument): Partial<UserDocument> {
    const { password, hashedRefreshToken, ...rest } = user.toObject();
    void password;
    void hashedRefreshToken;
    return rest;
  }
}
