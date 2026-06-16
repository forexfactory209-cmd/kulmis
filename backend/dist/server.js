"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const socket_io_1 = require("socket.io");
const server = http_1.default.createServer(app_1.default);
// Socket.io initialization
const io = new socket_io_1.Server(server, {
    cors: {
        origin: config_1.config.corsOrigin,
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });
    socket.on('send_message', (data) => {
        io.to(data.conversationId).emit('receive_message', data.message);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = config_1.config.port;
server.listen(PORT, () => {
    console.log(`Server running in ${config_1.config.env} mode on port ${PORT}`);
});
