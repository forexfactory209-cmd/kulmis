import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRepository } from '../repositories/auth.repository';

const authRepository = new AuthRepository();

export class AuthService {
  private generateAccessToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '12h' }
    );
  }

  private generateRefreshToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'FREELANCER' | 'CLIENT';
  }) {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw { status: 400, message: 'Email already registered' };
    }

    const user = await authRepository.createUser(data);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        freelancerProfile: user.freelancerProfile,
        clientProfile: user.clientProfile,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        freelancerProfile: user.freelancerProfile,
        clientProfile: user.clientProfile,
      },
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret) as any;
      const user = await authRepository.findUserById(decoded.userId);
      if (!user) {
        throw { status: 404, message: 'User not found' };
      }
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return { accessToken, refreshToken };
    } catch (error) {
      throw { status: 401, message: 'Invalid refresh token' };
    }
  }
}
