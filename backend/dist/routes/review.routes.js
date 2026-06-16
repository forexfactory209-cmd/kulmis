"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const review_repository_1 = require("../repositories/review.repository");
const router = (0, express_1.Router)();
const reviewRepo = new review_repository_1.ReviewRepository();
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { projectId, revieweeId, rating, comment } = req.body;
        const review = await reviewRepo.create({
            projectId, reviewerId: req.user.userId, revieweeId, rating, comment,
        });
        res.status(201).json({ success: true, data: review, message: 'Review submitted' });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.get('/me/received', auth_1.authMiddleware, async (req, res) => {
    try {
        const reviews = await reviewRepo.findByUser(req.user.userId);
        res.json({ success: true, data: reviews });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await reviewRepo.findByUser(req.params.userId);
        res.json({ success: true, data: reviews });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
router.get('/project/:projectId', async (req, res) => {
    try {
        const reviews = await reviewRepo.findByProject(req.params.projectId);
        res.json({ success: true, data: reviews });
    }
    catch (e) {
        res.status(500).json({ success: false, error: { message: e.message } });
    }
});
exports.default = router;
