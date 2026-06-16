"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
class UserController {
    async getFreelancers(req, res) {
        try {
            const { search, skill, minRate, maxRate, page, limit } = req.query;
            const result = await userService.getFreelancers({
                search: search,
                skill: skill,
                minRate: minRate ? Number(minRate) : undefined,
                maxRate: maxRate ? Number(maxRate) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateProfile(req, res) {
        try {
            const user = await userService.updateProfile(req.user.userId, req.body);
            res.json({ success: true, data: user, message: 'Profile updated' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async updateFreelancerProfile(req, res) {
        try {
            const profile = await userService.updateFreelancerProfile(req.user.userId, req.body);
            res.json({ success: true, data: profile, message: 'Freelancer profile updated' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.UserController = UserController;
