import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { RolesService } from '../roles/roles.service';
import { resolveEffectivePermissions } from '../rbac/permissions.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (prisma) => {
      const tenant = await prisma.tenant.create({
        data: {
          name: dto.businessName,
          businessType: dto.businessType,
          branches: {
            create: {
              name: 'Main Branch',
            },
          },
        },
      });

      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          tenantId: tenant.id,
        },
      });

      return { user, tenant };
    });

    await this.rolesService.ensureDefaultRoles(result.tenant.id);

    return this.issueSession(result.user.id, result.tenant.businessType);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password).catch(() => false);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    return this.issueSession(user.id, tenant?.businessType || 'RESTAURANT');
  }

  async pinLogin(pin: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { pin, tenantId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid PIN code');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    return this.issueSession(user.id, tenant?.businessType || 'RESTAURANT');
  }

  private async issueSession(userId: string, businessType: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const permissions = resolveEffectivePermissions(user);
    const roleLabel = user.role?.name ?? 'Owner';

    const accessToken = this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      businessType,
      permissions,
      roleName: roleLabel,
    });

    return {
      accessToken,
      user: {
        name: user.name,
        role: roleLabel,
        permissions,
      },
    };
  }
}
