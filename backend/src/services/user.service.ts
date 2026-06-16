import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class UserService {
  async getFreelancers(filters: {
    search?: string;
    skill?: string;
    minRate?: number;
    maxRate?: number;
    page?: number;
    limit?: number;
  }) {
    return userRepository.findFreelancers(filters);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  }

  async updateProfile(userId: string, data: any) {
    return userRepository.updateProfile(userId, data);
  }

  async updateFreelancerProfile(userId: string, data: any) {
    return userRepository.updateFreelancerProfile(userId, data);
  }

  async getAllUsers(filters: { role?: string; page?: number; limit?: number }) {
    return userRepository.findAll(filters);
  }

  async toggleFavorite(clientId: string, freelancerId: string) {
    return userRepository.toggleFavorite(clientId, freelancerId);
  }

  async getFavorites(clientId: string) {
    return userRepository.getFavorites(clientId);
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    return userRepository.changePassword(userId, currentPass, newPass);
  }

  async toggleTwoFactor(userId: string) {
    return userRepository.toggleTwoFactor(userId);
  }

  async deleteAccount(userId: string) {
    return userRepository.deleteAccount(userId);
  }
}
