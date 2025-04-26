import { webSocketServer } from './websocket_server'
import { httpServer } from "./http_server";

const WEBSOCKET_PORT = 3000;
const HTTP_PORT = 8181;

webSocketServer.listen(WEBSOCKET_PORT, () => {
  console.log(`WebSocketServer is running on port: ${WEBSOCKET_PORT}`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`Cleint started: http://localhost:${HTTP_PORT}`);
});
