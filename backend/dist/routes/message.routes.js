"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const message_repository_1 = require("../repositories/message.repository");
const router = (0, express_1.Router)();
const msgRepo = new message_repository_1.MessageRepository();
router.get('/conversations', auth_1.authMiddleware, async (req, res) => {
    try {
        const conversations = await msgRepo.getConversations(req.user.userId);
        res.json({ success: true, data: conversations });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.get('/:conversationId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const messages = await msgRepo.getMessages(req.params.conversationId, Number(page) || 1, Number(limit) || 50);
        res.json({ success: true, data: messages });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.post('/:conversationId', auth_1.authMiddleware, async (req, res) => {
    try {
        const message = await msgRepo.sendMessage({
            conversationId: req.params.conversationId,
            senderId: req.user.userId,
            content: req.body.content,
        });
        res.status(201).json({ success: true, data: message });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.post('/conversations/create', auth_1.authMiddleware, async (req, res) => {
    try {
        const { participantId } = req.body;
        const conversation = await msgRepo.createConversation([req.user.userId, participantId]);
        res.status(201).json({ success: true, data: conversation });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
exports.default = router;
