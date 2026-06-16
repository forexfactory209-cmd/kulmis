import http from 'http';
import app from './app';
import { config } from './config';
import { initSocket } from './lib/socket';

const server = http.createServer(app);

// Initialize decoupled Socket.io
initSocket(server);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});
