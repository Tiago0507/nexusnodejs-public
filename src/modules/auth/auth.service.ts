import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserService } from "../user/user.service";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";
import type { UserDocument } from "../user/user.model";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError";

/**
 * Service class responsible for handling core authentication logic,
 * including user registration, login, and token generation/refreshing.
 */
export class AuthService {
  /**
   * Initializes a new instance of the AuthService.
   * @param {UserService} userService - The service for user-related database operations.
   */
  constructor(private userService: UserService) {}

  /**
   * Registers a new user by delegating the creation logic to the UserService.
   * @param {RegisterDto} userData - The data for the new user.
   * @returns {Promise<UserDocument>} The newly created user document.
   */
  public async register(userData: RegisterDto): Promise<UserDocument> {
    // Delegates user creation to the user service, which handles hashing and saving.
    return this.userService.createUser(userData);
  }

  /**
   * Authenticates a user based on email and password.
   * If credentials are valid, it generates and returns access and refresh tokens.
   * @param {LoginDto} loginData - The user's login credentials (email and password).
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} An object containing the tokens.
   * @throws {BadRequestError} If the credentials are invalid.
   */
  public async login(
    loginData: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Fetches the user along with their stored password hash.
    const userWithPassword = await this.userService.findUserByEmailWithPassword(
      loginData.email
    );

    // Validates the user's existence and compares the provided password with the stored hash.
    if (
      !userWithPassword ||
      !(await bcrypt.compare(loginData.password, userWithPassword.passwordHash))
    ) {
      throw new BadRequestError("Credenciales inválidas.");
    }

    // Generates new tokens upon successful authentication.
    const accessToken = this.generateAccessToken(userWithPassword);
    const refreshToken = this.generateRefreshToken(userWithPassword);

    return { accessToken, refreshToken };
  }

  /**
   * Generates a new access token from a valid refresh token.
   * @param {string} refreshToken - The refresh token provided by the client.
   * @returns {{ accessToken: string }} A new access token.
   * @throws {ApiError} If the refresh token is invalid or expired.
   */
  public refresh(refreshToken: string): { accessToken: string } {
    try {
      // Verifies the refresh token to ensure its validity.
      const secret = process.env.JWT_REFRESH_SECRET!;
      const decoded = jwt.verify(refreshToken, secret) as { id: string };

      // If valid, creates a new access token for the user identified in the refresh token.
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
      // Catches errors from jwt.verify (e.g., expiration, invalid signature).
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Refresh token inválido o expirado."
      );
    }
  }

  /**
   * Generates a JWT access token for a given user.
   * @param {UserDocument} user - The user document to generate the token for.
   * @returns {string} The signed JWT access token.
   */
  private generateAccessToken(user: UserDocument): string {
    const payload = { id: user.id, role: (user.role as any).name };
    const secret = process.env.JWT_SECRET!;
    const options: SignOptions = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN! as any,
    };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Generates a JWT refresh token for a given user.
   * @param {UserDocument} user - The user document to generate the token for.
   * @returns {string} The signed JWT refresh token.
   */
  private generateRefreshToken(user: UserDocument): string {
    const payload = { id: user.id };
    const secret = process.env.JWT_REFRESH_SECRET!;
    const options: SignOptions = {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN! as any,
    };

    return jwt.sign(payload, secret, options);
  }
}