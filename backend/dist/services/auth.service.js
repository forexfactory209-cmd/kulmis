"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const auth_repository_1 = require("../repositories/auth.repository");
const authRepository = new auth_repository_1.AuthRepository();
class AuthService {
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwtSecret, { expiresIn: '15m' });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwtRefreshSecret, { expiresIn: '7d' });
    }
    async register(data) {
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
    async login(email, password) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw { status: 401, message: 'Invalid email or password' };
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
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
    async getMe(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtRefreshSecret);
            const user = await authRepository.findUserById(decoded.userId);
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { accessToken, refreshToken };
        }
        catch (error) {
            throw { status: 401, message: 'Invalid refresh token' };
        }
    }
}
exports.AuthService = AuthService;
