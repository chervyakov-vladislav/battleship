import { WebSocket as WsWebSocket } from 'ws';
import { connectionDB } from '../database/connections';
import { ResponseDto } from '../shared/types';

class ConnectionController {
  addConnection(userId: string, ws: WsWebSocket) {
    connectionDB.addConnection(userId, ws);
  }

  removeConnectionBySocket(ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws);
    if (userId) {
      connectionDB.removeConnectionByUserId(userId);
    }
  }

  sendMessage(response: ResponseDto, recipients: string[] | 'all') {
    const message = this.prepareMessage(response);

    if (recipients === 'all') {
      for (const ws of connectionDB.getAllConnections()) {
        if (ws.readyState === ws.OPEN) {
          ws.send(message);
        }
      }
    } else {
      for (const userId of recipients) {
        const ws = connectionDB.findSocketByUserId(userId);
        if (ws && ws.readyState === ws.OPEN) {
          ws.send(message);
        }
      }
    }
  }

  sendError(ws: WsWebSocket, message: string, code = 500) {
    ws.send(JSON.stringify({ code, message }));
  }

  private prepareMessage(response: ResponseDto) {
    return JSON.stringify({
      ...response,
      data: JSON.stringify(response.data),
    });
  }
}

export const connectionController = new ConnectionController();
