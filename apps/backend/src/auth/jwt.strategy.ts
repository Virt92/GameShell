import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  clubId: string;
  role?: string;
  type: 'staff' | 'player';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'gameshell-dev-secret'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      clubId: payload.clubId,
      role: payload.role,
      type: payload.type,
    };
  }
}
