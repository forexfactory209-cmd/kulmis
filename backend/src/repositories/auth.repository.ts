import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        freelancerProfile: { include: { skills: true } },
        clientProfile: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        freelancerProfile: { include: { skills: true, portfolios: true, certificates: true } },
        clientProfile: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'FREELANCER' | 'CLIENT';
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
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

  async updateUser(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }
}
