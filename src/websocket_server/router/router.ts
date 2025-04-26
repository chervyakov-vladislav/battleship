import { WebSocket as WsWebSocket } from 'ws';
import { ClientMessage, Command } from '@/types/types';
import { userController } from '../controllers/userController';
import { roomController } from '../controllers/roomController';


class Router {
  routeMessage(msg: ClientMessage, ws: WsWebSocket) {
    switch (msg.type) {
      case Command.REG:
        userController.regUser(msg.data, ws);
        break;

      case Command.CREATE_ROOM:
        roomController.createRoom(ws);
        break;
    
      default:
        throw new Error('Invalid message type');
    }
  }
}

export const router = new Router();