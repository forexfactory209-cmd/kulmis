"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
// All routes require authentication and 'ADMIN' role
router.use(auth_1.authMiddleware);
router.use((0, auth_1.checkRole)(['ADMIN']));
// Statistics & Analytics Charts
router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/charts', (req, res) => adminController.getCharts(req, res));
// User management routes
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.put('/users/:id/status', (req, res) => adminController.updateUserStatus(req, res));
router.put('/users/:id/verify', (req, res) => adminController.verifyUser(req, res));
// Project management routes
router.get('/projects', (req, res) => adminController.getProjects(req, res));
router.put('/projects/:id/status', (req, res) => adminController.updateProjectStatus(req, res));
// Financial transactions & Escrow ledger routes
router.get('/transactions', (req, res) => adminController.getTransactions(req, res));
// Dispute tickets management routes
router.get('/disputes', (req, res) => adminController.getDisputes(req, res));
router.put('/disputes/:id', (req, res) => adminController.updateDispute(req, res));
// Global platform settings routes
router.get('/settings', (req, res) => adminController.getSettings(req, res));
router.put('/settings', (req, res) => adminController.updateSettings(req, res));
exports.default = router;
