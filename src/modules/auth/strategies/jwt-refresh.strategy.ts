import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { CONFIG_KEYS } from '../../../common/constants/config.constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>(CONFIG_KEYS.JWT_REFRESH_SECRET);
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtRefreshPayload {
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1] ?? '';
    return { ...payload, refreshToken };
  }
}
