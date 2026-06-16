"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notification_repository_1 = require("../repositories/notification.repository");
const router = (0, express_1.Router)();
const notifRepo = new notification_repository_1.NotificationRepository();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const data = await notifRepo.findByUser(req.user.userId, Number(page) || 1, Number(limit) || 20);
        res.json({ success: true, data });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.put('/:id/read', auth_1.authMiddleware, async (req, res) => {
    try {
        await notifRepo.markAsRead(req.params.id, req.user.userId);
        res.json({ success: true, message: 'Marked as read' });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.put('/read-all', auth_1.authMiddleware, async (req, res) => {
    try {
        await notifRepo.markAllAsRead(req.user.userId);
        res.json({ success: true, message: 'All marked as read' });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
exports.default = router;
