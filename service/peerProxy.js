const { WebSocketServer, WebSocket } = require('ws');

function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  socketServer.on('connection', (socket, req) => {
    socket.isAlive = true;
    console.log('WS connected:', req.socket.remoteAddress);

    socket.on('pong', () => {
      socket.isAlive = true;
    });

    socket.on('close', () => {
      console.log('WS disconnected');
    });

    socket.on('error', (err) => {
      console.error('WS error:', err);
    });
  });

  const interval = setInterval(() => {
    socketServer.clients.forEach((client) => {
      if (client.isAlive === false) {
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 10000);

  socketServer.on('close', () => clearInterval(interval));

  return socketServer;
}

module.exports = { peerProxy };
