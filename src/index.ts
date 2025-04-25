import { WebSocketServer } from 'ws';
import { httpServer } from "./http_server/index";

const HTTP_PORT = 8181;

const webSocketServer = new WebSocketServer({ port: 3000 },
  () => console.log(`WebSocketServer is running on port: 3000!`)
);

webSocketServer.on('connection', (ws) => {
  ws.on('close', async () => {
    console.log(`Client disconnected`);
  });

  ws.on('message', (message) => {
    console.log(JSON.parse(message.toString()));
    ws.send(JSON.stringify('Приветик'))
  });
});

webSocketServer.on('error ', (error) => {
  console.log(`error ${error.message}`);
});

webSocketServer.on('close', () => {
  console.log(`close`);
});

console.log(`Cleint started: http://localhost:${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);
