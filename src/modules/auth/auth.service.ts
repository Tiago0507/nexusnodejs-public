import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserService } from "../user/user.service.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { UserDocument } from "../user/user.model.js";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError.js";

export class AuthService {
  constructor(private userService: UserService) {}

  public async register(userData: RegisterDto): Promise<UserDocument> {
    return this.userService.createUser(userData);
  }

  public async login(
    loginData: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userWithPassword = await this.userService.findUserByEmailWithPassword(
      loginData.email
    );

    if (
      !userWithPassword ||
      !(await bcrypt.compare(loginData.password, userWithPassword.passwordHash))
    ) {
      throw new BadRequestError("Credenciales inválidas.");
    }

    const accessToken = this.generateAccessToken(userWithPassword);
    const refreshToken = this.generateRefreshToken(userWithPassword);

    return { accessToken, refreshToken };
  }

  public refresh(refreshToken: string): { accessToken: string } {
    try {
      const secret = process.env.JWT_REFRESH_SECRET!;
      const decoded = jwt.verify(refreshToken, secret) as { id: string };

      const accessTokenSecret = process.env.JWT_SECRET!;

      const options: SignOptions = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN! as any,
      };

      const accessToken = jwt.sign(
        { id: decoded.id },
        accessTokenSecret,
        options
      );

      return { accessToken };
    } catch (error) {
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Refresh token inválido o expirado."
      );
    }
  }

  private generateAccessToken(user: UserDocument): string {
    const payload = { id: user.id, role: (user.role as any).name };
    const secret = process.env.JWT_SECRET!;

    const options: SignOptions = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN! as any,
    };

    return jwt.sign(payload, secret, options);
  }

  private generateRefreshToken(user: UserDocument): string {
    const payload = { id: user.id };
    const secret = process.env.JWT_REFRESH_SECRET!;

    const options: SignOptions = {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN! as any,
    };

    return jwt.sign(payload, secret, options);
  }
}
