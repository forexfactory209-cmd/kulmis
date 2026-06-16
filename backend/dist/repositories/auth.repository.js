"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthRepository {
    async findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                freelancerProfile: { include: { skills: true } },
                clientProfile: true,
            },
        });
    }
    async findUserById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                freelancerProfile: { include: { skills: true, portfolios: true, certificates: true } },
                clientProfile: true,
            },
        });
    }
    async createUser(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        return prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                ...(data.role === 'FREELANCER'
                    ? { freelancerProfile: { create: {} } }
                    : { clientProfile: { create: {} } }),
            },
            include: {
                freelancerProfile: true,
                clientProfile: true,
            },
        });
    }
    async updateUser(id, data) {
        return prisma_1.prisma.user.update({ where: { id }, data });
    }
}
exports.AuthRepository = AuthRepository;
