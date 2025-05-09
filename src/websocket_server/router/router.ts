import { WebSocket as WsWebSocket } from 'ws';
import { ClientMessage} from '../shared/types';
import { userController } from '../controllers/userController';
import { roomController } from '../controllers/roomController';
import { connectionController } from '../controllers/connectionController';
import { Command } from '../shared/constants';
import { gameController } from '../controllers/gameController';
import { botController } from '../controllers/botController';


class Router {
  routeMessage(msg: ClientMessage, ws: WsWebSocket) {
    switch (msg.type) {
      case Command.REG:
        userController.regUser(msg.data, ws);
        break;

      case Command.CREATE_ROOM:
        roomController.createRoom(ws);
        break;

      case Command.ADD_USER_TO_ROOM:
        roomController.addUserToRoom(msg.data.indexRoom, ws);
        break;

      case Command.ADD_SHIPS:
        gameController.addPlayerShips(msg.data);
        break;
      
      case Command.ATTACK:
        gameController.handleAttack(msg.data);
        break;
      
      case Command.RANDOM_ATTACK:
        gameController.handleRandomAttack(msg.data);
        break;
      
      case Command.SINGLE_PLAY:
        botController.initGame(ws);
        break;

      default:
        connectionController.sendError(ws, 'Unexpected command')
        break;
    }
  }
}

export const router = new Router();