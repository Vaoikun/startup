const { WebSocketServer, WebSocket } = require('ws');

function peerProxy(httpServer) {
  // Create a websocket object
  const socketServer = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });


  socketServer.on('connection', (socket) => {
    socket.isAlive = true;

    console.log('WS connected:', req.socket.remoteAddress);

    // Forward messages to everyone except the sender
    socket.on('message', function message(data) {
      socketServer.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    // Respond to pong messages by marking the connection alive
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

  // Periodically send out a ping message to make sure clients are alive
  const interval = setInterval(() => {
      socketServer.clients.forEach((client) => {
        if (client.isAlive === false) {
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, 10000);

    socketServer.on('close', () => {
      clearInterval(interval);
    });

    return socketServer;
}

module.exports = { peerProxy };
