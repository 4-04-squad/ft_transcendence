import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    // Retrieve JWT from cookie
    static extractJWT(req: Request) {
        if (req && req.cookies && process.env.JWT_NAME in req.cookies) {
            return req.cookies[process.env.JWT_NAME];
        }
        return null;
    }

    async validate(payload: { id: number; email: string }) {
        return payload;
    }
}
