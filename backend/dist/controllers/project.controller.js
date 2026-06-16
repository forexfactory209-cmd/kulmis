"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const projectService = new project_service_1.ProjectService();
class ProjectController {
    async create(req, res) {
        try {
            const project = await projectService.createProject({
                clientId: req.user.userId,
                ...req.body,
            });
            res.status(201).json({ success: true, data: project, message: 'Project created' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getAll(req, res) {
        try {
            const { status, category, search, page, limit } = req.query;
            const result = await projectService.getProjects({
                status,
                category,
                search,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getMyProjects(req, res) {
        try {
            const { status, page, limit } = req.query;
            const result = await projectService.getProjects({
                clientId: req.user.userId,
                status,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async getById(req, res) {
        try {
            const project = await projectService.getProjectById(req.params.id);
            res.json({ success: true, data: project });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async update(req, res) {
        try {
            const project = await projectService.updateProject(req.params.id, req.user.userId, req.body);
            res.json({ success: true, data: project, message: 'Project updated' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
    async delete(req, res) {
        try {
            await projectService.deleteProject(req.params.id, req.user.userId);
            res.json({ success: true, message: 'Project deleted' });
        }
        catch (error) {
            res.status(error.status || 500).json({ success: false, error: { message: error.message } });
        }
    }
}
exports.ProjectController = ProjectController;
