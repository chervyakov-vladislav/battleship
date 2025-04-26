import { RawData, WebSocketServer as WS } from 'ws';
import { router } from '@/router/router';
import { ClientMessage } from './types/types';

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
        console.log('New client connected');

        ws.on('close', async () => {
          console.log(`Client disconnected`);
        });
      
        ws.on('message', (message) => {
          const parsedMessage = this.parseReqMessage(message);
          const result = router.routeMessage(parsedMessage);
          const parsedResult = this.pasreResMessage(result);

          ws.send(parsedResult)
        });
      } catch (error) {
        ws.send(JSON.stringify({ code: 500, message: 'Internal server error' }));
        console.log('Unexpected error:', error);
      }
    });
    
    this.webSocketServer.on('error', (error) => {
      console.log(`error ${error.message}`);
    });
  }

  private parseReqMessage(rawMessage: RawData) {
    const parsedMessage = JSON.parse(rawMessage.toString());
    const parsedMessageData = JSON.parse(parsedMessage.data);

    return {
      ...parsedMessage,
      data: parsedMessageData
    } as ClientMessage;
  }

  // написать типы
  private pasreResMessage(result: any) {
    return JSON.stringify({
      ...result,
      data: JSON.stringify(result.data)
    });
  }
}

export const webSocketServer = new WebSocketServer();