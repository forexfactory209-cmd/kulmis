"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const userRepository = new user_repository_1.UserRepository();
class UserService {
    async getFreelancers(filters) {
        return userRepository.findFreelancers(filters);
    }
    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user)
            throw { status: 404, message: 'User not found' };
        return user;
    }
    async updateProfile(userId, data) {
        return userRepository.updateProfile(userId, data);
    }
    async updateFreelancerProfile(userId, data) {
        return userRepository.updateFreelancerProfile(userId, data);
    }
    async getAllUsers(filters) {
        return userRepository.findAll(filters);
    }
}
exports.UserService = UserService;
