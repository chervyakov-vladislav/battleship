import { RawData, WebSocketServer as WS } from 'ws';
import { router } from './router/router';
import { ClientMessage } from './shared/types';
import { connectionController } from './controllers/connectionController';

class WebSocketServer {
  private webSocketServer: WS | null = null;

  listen(port: number, cb: () => void) {
    this.webSocketServer = new WS({ port }, cb);
    this.createListeners();
  }

  private createListeners() {
    if (!this.webSocketServer) throw new Error('WebSocketServer is not initialized');

    this.webSocketServer.on('connection', (ws) => {
      try {
        ws.on('close', async () => {
          connectionController.disconnect(ws);
        });
      
        ws.on('message', (message) => {
          const parsedMessage = this.parseReqMessage(message);
          router.routeMessage(parsedMessage, ws);
        });
      } catch (error) {
        connectionController.sendError(ws, 'Internal server error');
        console.log('Unexpected error:', error);
      }
    });
    
    this.webSocketServer.on('error', (error) => {
      console.log(`error ${error.message}`);
    });
  }

  private parseReqMessage(rawMessage: RawData) {
    const parsedMessage = JSON.parse(rawMessage.toString());
    const parsedMessageData = parsedMessage.data !== '' ? JSON.parse(parsedMessage.data) : '';

    return {
      ...parsedMessage,
      data: parsedMessageData
    } as ClientMessage;
  }
}

export const webSocketServer = new WebSocketServer();