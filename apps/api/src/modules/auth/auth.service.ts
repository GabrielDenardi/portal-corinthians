import type { AdminLoginDTO, SessionDTO, UserRole } from "@portal-corinthians/contracts";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../../prisma/prisma.service";
import { hashPassword, verifyPassword } from "./password.utils";
import { signSessionToken, verifySessionToken } from "./session-token";

@Injectable()
export class AuthService {
  private readonly sessionSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.sessionSecret = this.configService.get<string>("PORTAL_SESSION_SECRET") ?? "portal-corinthians-dev-secret";
  }

  async login(input: AdminLoginDTO, ip = "unknown") {
    enforceLoginRateLimit(ip, input.email);

    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const token = signSessionToken(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      this.sessionSecret,
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } satisfies SessionDTO["user"],
    };
  }

  async getSessionFromToken(token: string) {
    const claims = verifySessionToken(token, this.sessionSecret);

    if (!claims) {
      throw new UnauthorizedException("Sessão inválida");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: claims.sub },
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      },
    };
  }

  async getSessionDTO(token: string): Promise<SessionDTO> {
    const session = await this.getSessionFromToken(token);
    return { user: session.user };
  }

  async upsertUser(input: {
    email: string;
    name: string;
    role: UserRole;
    password?: string;
  }) {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          role: input.role,
          ...(input.password ? { passwordHash: hashPassword(input.password) } : {}),
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        name: input.name,
        role: input.role,
        passwordHash: hashPassword(input.password ?? "portal123"),
      },
    });
  }
}

const loginAttempts = new Map<string, { count: number; expiresAt: number }>();

function enforceLoginRateLimit(ip: string, email: string) {
  const key = `${ip}:${email.toLowerCase()}`;
  const now = Date.now();
  const bucket = loginAttempts.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    loginAttempts.set(key, { count: 1, expiresAt: now + 5 * 60_000 });
    return;
  }

  if (bucket.count >= 10) {
    throw new UnauthorizedException("Muitas tentativas de login");
  }

  bucket.count += 1;
  loginAttempts.set(key, bucket);
}
